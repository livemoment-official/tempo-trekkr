import { useEffect, useState } from 'react';
import { useUserLocation } from './useUserLocation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useAutoGeolocation() {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { updateLocation, getUserLocation } = useUserLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const getLocation = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // First, check if user already has a saved location
        const savedLocation = await getUserLocation();
        if (savedLocation) {
          setLocation({ lat: savedLocation.lat, lng: savedLocation.lng });
          setIsLoading(false);
          return;
        }

        // If no saved location and geolocation is available, request it
        if (!navigator.geolocation) {
          setIsLoading(false);
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          });
        });

        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };

        setLocation({ lat: userLocation.lat, lng: userLocation.lng });
        
        // Save location to profile in background
        updateLocation(userLocation);
        
      } catch (error) {
        console.error('Geolocation error:', error);
        
        // Fallback to Rome coordinates for demo
        const fallbackLocation = { lat: 41.9028, lng: 12.4964 };
        setLocation(fallbackLocation);
        
        toast({
          title: "Posizione non disponibile",
          description: "Usando posizione di default (Roma) per il demo",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    getLocation();
  }, [user, updateLocation, getUserLocation, toast]);

  return { location, isLoading };
}