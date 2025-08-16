import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserLocation } from "./useGeolocation";

export function useUserLocation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Save user location to profile
  const saveLocation = useCallback(async (location: UserLocation) => {
    if (!user) return false;

    setIsSaving(true);
    try {
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

      return true;
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio della posizione",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, toast]);

  // Get user location from profile
  const getUserLocation = useCallback(async (userId?: string): Promise<UserLocation | null> => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', targetUserId)
        .maybeSingle();

      if (error) throw error;

      if (data?.location && typeof data.location === 'object') {
        const loc = data.location as any;
        if (loc.lat && loc.lng) {
          return {
            lat: loc.lat,
            lng: loc.lng,
            accuracy: loc.accuracy,
            timestamp: loc.updated_at ? new Date(loc.updated_at).getTime() : undefined
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting user location:', error);
      return null;
    }
  }, [user]);

  // Update location and save to profile
  const updateLocation = useCallback(async (location: UserLocation) => {
    const success = await saveLocation(location);
    if (success) {
      toast({
        title: "Posizione aggiornata",
        description: "La tua posizione è stata salvata nel profilo"
      });
    }
    return success;
  }, [saveLocation, toast]);

  // Calculate distance between two points in kilometers
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

  // Format distance for display
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
    isSaving,
    saveLocation,
    getUserLocation,
    updateLocation,
    calculateDistance,
    formatDistance
  };
}