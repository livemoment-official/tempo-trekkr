import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  loading: boolean;
}

export function useGeolocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>({
    granted: false,
    denied: false,
    prompt: true,
    loading: false
  });
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  // Check if geolocation is supported
  const isSupported = 'geolocation' in navigator;

  // Request location permission and get current position
  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Geolocalizzazione non supportata",
        description: "Il tuo browser non supporta la geolocalizzazione",
        variant: "destructive"
      });
      return;
    }

    setPermission(prev => ({ ...prev, loading: true }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const newLocation: UserLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(newLocation);
      setPermission({
        granted: true,
        denied: false,
        prompt: false,
        loading: false
      });

      toast({
        title: "Posizione ottenuta",
        description: "La tua posizione è stata aggiornata con successo"
      });

      return newLocation;
    } catch (error: any) {
      console.error('Geolocation error:', error);
      
      let message = "Errore nel recupero della posizione";
      if (error.code === 1) {
        message = "Permesso di geolocalizzazione negato";
        setPermission({
          granted: false,
          denied: true,
          prompt: false,
          loading: false
        });
      } else if (error.code === 2) {
        message = "Posizione non disponibile";
      } else if (error.code === 3) {
        message = "Timeout nel recupero della posizione";
      }

      toast({
        title: "Errore geolocalizzazione",
        description: message,
        variant: "destructive"
      });

      setPermission(prev => ({ ...prev, loading: false }));
      return null;
    }
  }, [isSupported, toast]);

  // Start watching position changes
  const startWatching = useCallback(() => {
    if (!isSupported || !permission.granted) return;

    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        setLocation(newLocation);
      },
      (error) => {
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 60000 // 1 minute
      }
    );

    setWatchId(id);
  }, [isSupported, permission.granted, watchId]);

  // Stop watching position changes
  const stopWatching = useCallback(() => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Check permission status on mount
  useEffect(() => {
    if (!isSupported) return;

    // Check if we have permission already
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setPermission({
            granted: true,
            denied: false,
            prompt: false,
            loading: false
          });
        } else if (result.state === 'denied') {
          setPermission({
            granted: false,
            denied: true,
            prompt: false,
            loading: false
          });
        }
      });
    }
  }, [isSupported]);

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    permission,
    isSupported,
    requestLocation,
    startWatching,
    stopWatching
  };
}