import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

export function AreaIndicator() {
  const { location, permission } = useGeolocation();
  const [areaName, setAreaName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!location) return;

    const reverseGeocode = async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    reverseGeocode();
  }, [location]);

  if (permission.prompt) {
    return (
      <Badge variant="outline" className="text-xs">
        <MapPin className="h-3 w-3 mr-1" />
        Posizione non attiva
      </Badge>
    );
  }

  if (!location) {
    return (
      <Badge variant="outline" className="text-xs">
        <MapPin className="h-3 w-3 mr-1" />
        Rilevamento posizione...
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <MapPin className="h-3 w-3 mr-1" />
      {isLoading ? (
        <>
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Rilevamento area...
        </>
      ) : (
        <>Area: {areaName} (5 km)</>
      )}
    </Badge>
  );
}