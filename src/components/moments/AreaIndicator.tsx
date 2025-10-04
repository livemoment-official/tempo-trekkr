import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { CitySelector } from "./CitySelector";

interface AreaIndicatorProps {
  maxDistance?: number;
}

export function AreaIndicator({ maxDistance = 5 }: AreaIndicatorProps) {
  const { location, permission, isLoading: geoLoading, error, requestLocation } = useUnifiedGeolocation();
  const [areaName, setAreaName] = useState<string>("");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showCitySelector, setShowCitySelector] = useState(false);

  useEffect(() => {
    if (!location) return;

    const reverseGeocode = async () => {
      setIsReverseGeocoding(true);
      try {
        const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
        
        if (!tokenData?.success || !tokenData?.token) {
          const coordName = `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
          setAreaName(coordName);
          setSelectedCity(coordName);
          return;
        }

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${tokenData.token}&types=place,locality,neighborhood`
        );

        if (!response.ok) throw new Error('Reverse geocoding failed');

        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const placeName = feature.text || feature.place_name;
          
          if (placeName) {
            setAreaName(placeName);
            setSelectedCity(placeName);
          } else {
            const coordName = `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
            setAreaName(coordName);
            setSelectedCity(coordName);
          }
        } else {
          const coordName = `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
          setAreaName(coordName);
          setSelectedCity(coordName);
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        const coordName = `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
        setAreaName(coordName);
        setSelectedCity(coordName);
      } finally {
        setIsReverseGeocoding(false);
      }
    };

    reverseGeocode();
  }, [location]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setAreaName(city);
  };

  const handleUseCurrentLocation = () => {
    requestLocation();
  };

  if (permission === 'denied') {
    return (
      <>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto mx-auto"
          disabled
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Posizione non consentita
        </Button>
      </>
    );
  }

  if (permission === 'prompt' || geoLoading) {
    return (
      <>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto mx-auto"
          disabled
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Rilevamento posizione...
        </Button>
      </>
    );
  }

  if (!location && !selectedCity) {
    return (
      <>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto mx-auto"
          onClick={() => setShowCitySelector(true)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {error || "Seleziona città"}
        </Button>
        <CitySelector
          open={showCitySelector}
          onOpenChange={setShowCitySelector}
          selectedCity={selectedCity}
          onCitySelect={handleCitySelect}
          onUseCurrentLocation={handleUseCurrentLocation}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        className="w-full sm:w-auto mx-auto hover:bg-secondary/80 transition-colors"
        onClick={() => setShowCitySelector(true)}
      >
        {isReverseGeocoding ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Rilevamento area...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            {selectedCity || areaName} ({maxDistance} km)
          </>
        )}
      </Button>
      
      <CitySelector
        open={showCitySelector}
        onOpenChange={setShowCitySelector}
        selectedCity={selectedCity}
        onCitySelect={handleCitySelect}
        onUseCurrentLocation={handleUseCurrentLocation}
      />
    </>
  );
}