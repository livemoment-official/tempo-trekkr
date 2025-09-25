import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";

export function AreaIndicator() {
  const { location, permission, isLoading: geoLoading, error } = useUnifiedGeolocation();
  const [areaName, setAreaName] = useState<string>("");
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  useEffect(() => {
    if (!location) return;

    const reverseGeocode = async () => {
      setIsReverseGeocoding(true);
      try {
        // Get Mapbox token
        const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
        
        if (!tokenData?.success || !tokenData?.token) {
          // Fallback to coordinates
          setAreaName(`${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`);
          return;
        }

        // Make reverse geocoding request to Mapbox
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${tokenData.token}&types=place,locality,neighborhood`
        );

        if (!response.ok) throw new Error('Reverse geocoding failed');

        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          // Get the most relevant location name (city, neighborhood, etc.)
          const feature = data.features[0];
          const placeName = feature.text || feature.place_name;
          
          if (placeName) {
            setAreaName(placeName);
          } else {
            setAreaName(`${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`);
          }
        } else {
          setAreaName(`${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`);
        }
      } catch (error) {
        console.error('Error in reverse geocoding:', error);
        // Fallback to coordinates
        setAreaName(`${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`);
      } finally {
        setIsReverseGeocoding(false);
      }
    };

    reverseGeocode();
  }, [location]);

  if (permission === 'denied') {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        Posizione non consentita
      </Badge>
    );
  }

  if (permission === 'prompt' || geoLoading) {
    return (
      <Badge variant="outline" className="text-xs">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Rilevamento posizione...
      </Badge>
    );
  }

  if (!location) {
    return (
      <Badge variant="outline" className="text-xs">
        <MapPin className="h-3 w-3 mr-1" />
        {error || "Posizione non disponibile"}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      {isReverseGeocoding ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Rilevamento area...
        </>
      ) : (
        <>{areaName} (5 km)</>
      )}
    </Badge>
  );
}