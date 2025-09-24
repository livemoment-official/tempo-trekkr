import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationState {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permission: 'prompt' | 'granted' | 'denied';
  hasTriedRequest: boolean;
}

const ROME_FALLBACK: UserLocation = {
  lat: 41.9028,
  lng: 12.4964,
  accuracy: 10000,
  timestamp: Date.now()
};

export function useUnifiedGeolocation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    permission: 'prompt',
    hasTriedRequest: false
  });

  const log = useCallback((message: string, data?: any) => {
    console.log(`🌍 [Geolocation] ${message}`, data || '');
  }, []);

  const updateLocationInProfile = useCallback(async (location: UserLocation) => {
    if (!user) return false;

    try {
      log('Saving location to profile', { lat: location.lat, lng: location.lng });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          location: {
            lat: location.lat,
            lng: location.lng,
            accuracy: location.accuracy,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      if (error) throw error;
      log('Location saved to profile successfully');
      return true;
    } catch (error) {
      log('Error saving location to profile', error);
      return false;
    }
  }, [user, log]);

  const checkBrowserSupport = useCallback(() => {
    const supported = 'geolocation' in navigator;
    log(`Browser geolocation support: ${supported}`);
    return supported;
  }, [log]);

  const checkPermission = useCallback(async () => {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        log(`Permission state: ${result.state}`);
        
        setState(prev => ({ 
          ...prev, 
          permission: result.state as 'prompt' | 'granted' | 'denied' 
        }));
        
        return result.state;
      }
    } catch (error) {
      log('Error checking permission', error);
    }
    return 'prompt';
  }, [log]);

  const getCurrentPosition = useCallback((): Promise<UserLocation> => {
    return new Promise((resolve, reject) => {
      if (!checkBrowserSupport()) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      log('Requesting current position...');
      
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          log('Position obtained successfully', location);
          resolve(location);
        },
        (error) => {
          log('Geolocation error', { code: error.code, message: error.message });
          reject(error);
        },
        options
      );
    });
  }, [checkBrowserSupport, log]);

  const requestLocationWithRetry = useCallback(async () => {
    if (state.isLoading) return;
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      hasTriedRequest: true 
    }));

    try {
      log(`Attempting to get location (attempt ${retryCount.current + 1}/${maxRetries})`);
      
      const location = await getCurrentPosition();
      
      setState(prev => ({ 
        ...prev, 
        location, 
        isLoading: false, 
        permission: 'granted',
        error: null 
      }));

      // Save to profile
      await updateLocationInProfile(location);
      
      toast({
        title: "Posizione ottenuta",
        description: "La tua posizione è stata aggiornata con successo"
      });

      retryCount.current = 0;
      return location;
      
    } catch (error: any) {
      log('Location request failed', error);
      
      let errorMessage = "Errore nel recupero della posizione";
      let permission: 'prompt' | 'granted' | 'denied' = 'prompt';
      
      if (error.code === 1) {
        errorMessage = "Permesso di geolocalizzazione negato";
        permission = 'denied';
      } else if (error.code === 2) {
        errorMessage = "Posizione non disponibile";
      } else if (error.code === 3) {
        errorMessage = "Timeout nel recupero della posizione";
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        permission 
      }));

      // Retry logic
      if (retryCount.current < maxRetries - 1 && error.code !== 1) {
        retryCount.current++;
        log(`Retrying in 2 seconds... (${retryCount.current}/${maxRetries})`);
        
        setTimeout(() => {
          requestLocationWithRetry();
        }, 2000);
        
        return;
      }

      // Final fallback to Rome
      if (error.code !== 1) { // Don't fallback if user denied permission
        log('Using Rome fallback location');
        
        setState(prev => ({ 
          ...prev, 
          location: ROME_FALLBACK, 
          error: "Usando posizione predefinita (Roma)" 
        }));

        await updateLocationInProfile(ROME_FALLBACK);
        
        toast({
          title: "Posizione predefinita",
          description: "Usando Roma come posizione di riferimento",
          variant: "default"
        });

        return ROME_FALLBACK;
      }

      toast({
        title: "Errore geolocalizzazione",
        description: errorMessage,
        variant: "destructive"
      });
      
      retryCount.current = 0;
      return null;
    }
  }, [state.isLoading, getCurrentPosition, updateLocationInProfile, toast, log]);

  const loadSavedLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!user) return null;

    try {
      log('Loading saved location from profile');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.location && typeof data.location === 'object') {
        const loc = data.location as any;
        if (loc.lat && loc.lng) {
          const savedLocation: UserLocation = {
            lat: loc.lat,
            lng: loc.lng,
            accuracy: loc.accuracy,
            timestamp: loc.updated_at ? new Date(loc.updated_at).getTime() : undefined
          };
          
          log('Saved location loaded successfully', savedLocation);
          return savedLocation;
        }
      }

      log('No saved location found');
      return null;
    } catch (error) {
      log('Error loading saved location', error);
      return null;
    }
  }, [user, log]);

  // Initialize location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      log('Initializing geolocation system');
      
      // Check permission first
      await checkPermission();
      
      // Try to load saved location first
      const savedLocation = await loadSavedLocation();
      if (savedLocation) {
        setState(prev => ({ 
          ...prev, 
          location: savedLocation,
          permission: 'granted'
        }));
        return;
      }

      // Auto-request location if user is authenticated
      if (user && !state.hasTriedRequest) {
        log('Auto-requesting location for authenticated user');
        requestLocationWithRetry();
      }
    };

    initializeLocation();
  }, [user, checkPermission, loadSavedLocation, requestLocationWithRetry, state.hasTriedRequest, log]);

  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const formatDistance = useCallback((distanceKm: number): string => {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }, []);

  return {
    ...state,
    requestLocation: requestLocationWithRetry,
    calculateDistance,
    formatDistance,
    updateLocationInProfile
  };
}