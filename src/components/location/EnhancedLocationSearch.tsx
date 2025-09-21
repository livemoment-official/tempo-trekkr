import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

interface LocationResult {
  place_name: string;
  center: [number, number]; // [lng, lat]
  place_type?: string[];
  properties?: {
    address?: string;
    category?: string;
  };
}

interface EnhancedLocationSearchProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  }) => void;
  placeholder?: string;
  value?: string;
  className?: string;
}

export function EnhancedLocationSearch({
  onLocationSelect,
  placeholder = "Cerca una località...",
  value = "",
  className = ""
}: EnhancedLocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { location, requestLocation } = useGeolocation();
  const [locationLoading, setLocationLoading] = useState(false);

  // Get Mapbox token from Supabase Edge Function
  const getMapboxToken = useCallback(async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) throw new Error(error.message);
      return data.token;
    } catch (error) {
      console.error('Failed to get Mapbox token:', error);
      return null;
    }
  }, []);

  // Search locations using Mapbox Geocoding API
  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getMapboxToken();
      if (!token) {
        console.warn('Mapbox token not available, using mock results');
        // Mock results for development
        const mockResults: LocationResult[] = [
          {
            place_name: `${searchQuery}, Milano, Italia`,
            center: [9.1900, 45.4642],
            properties: { address: `${searchQuery}, Milano, Italia` }
          },
          {
            place_name: `${searchQuery}, Roma, Italia`,
            center: [12.4964, 41.9028],
            properties: { address: `${searchQuery}, Roma, Italia` }
          }
        ];
        setResults(mockResults);
        setIsLoading(false);
        return;
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${token}&country=IT&limit=5&language=it`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch locations');
      
      const data = await response.json();
      setResults(data.features || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [getMapboxToken]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchLocations]);

  // Handle current location
  const handleCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const currentLocation = await requestLocation();
      if (currentLocation) {
        onLocationSelect({
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          name: "La tua posizione",
          address: "Posizione corrente"
        });
        setQuery("La tua posizione");
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-12"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-8 w-8 p-0"
          onClick={handleCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Navigation className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Results dropdown */}
      {showResults && (query.length >= 3 || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto">
          <CardContent className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Cercando...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2 text-left"
                    onClick={() => {
                      const [lng, lat] = result.center;
                      onLocationSelect({
                        lat,
                        lng,
                        name: result.place_name.split(',')[0],
                        address: result.place_name
                      });
                      setQuery(result.place_name);
                      setShowResults(false);
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">
                        {result.place_name.split(',')[0]}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.place_name}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : query.length >= 3 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Nessun risultato trovato
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}