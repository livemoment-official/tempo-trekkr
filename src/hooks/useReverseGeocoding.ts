import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ReverseGeocodingResult {
  formatted_address: string;
  street: string;
  city: string;
  country: string;
  province: string;
}

export function useReverseGeocoding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<ReverseGeocodingResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get Mapbox token from edge function
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
      
      if (tokenError || !tokenData?.token) {
        throw new Error('Failed to get Mapbox token');
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${tokenData.token}&language=it&types=address,poi`
      );

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const components = feature.context || [];
        
        // Extract address components
        let street = '';
        let city = '';
        let country = '';
        let province = '';

        // Get street from place name or address
        if (feature.place_name) {
          const parts = feature.place_name.split(',');
          street = parts[0]?.trim() || '';
        }

        // Extract city, province, and country from context
        components.forEach((component: any) => {
          if (component.id?.includes('place')) {
            city = component.text || city;
          } else if (component.id?.includes('region')) {
            province = component.short_code?.replace(/IT-/, '') || component.text || province;
          } else if (component.id?.includes('country')) {
            country = component.text || country;
          }
        });

        const result: ReverseGeocodingResult = {
          formatted_address: feature.place_name || `${lat}, ${lng}`,
          street: street || 'Via sconosciuta',
          city: city || 'Città sconosciuta',
          country: country || 'Italia',
          province: province || ''
        };

        return result;
      }

      // Fallback if no results
      return {
        formatted_address: `${lat}, ${lng}`,
        street: 'Posizione',
        city: 'Città sconosciuta',
        country: 'Italia',
        province: ''
      };

    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setError(err instanceof Error ? err.message : 'Errore durante la ricerca dell\'indirizzo');
      
      // Return fallback result on error
      return {
        formatted_address: `${lat}, ${lng}`,
        street: 'La tua posizione',
        city: 'Posizione attuale',
        country: 'Italia',
        province: ''
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    reverseGeocode,
    isLoading,
    error
  };
}