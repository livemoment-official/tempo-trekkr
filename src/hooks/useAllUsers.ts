import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  mood: string;
  job_title: string;
  interests: string[];
  location: {
    lat: number;
    lng: number;
  } | null;
  distance_km: number | null;
}

interface UserLocation {
  lat: number;
  lng: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useAllUsers(userLocation: UserLocation | null) {
  return useQuery({
    queryKey: ['all-users', userLocation],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          username,
          avatar_url,
          mood,
          job_title,
          interests,
          location
        `)
        .neq('id', (await supabase.auth.getUser())?.data?.user?.id || '')
        .not('name', 'is', null)
        .not('name', 'eq', '');

      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }

      // Transform and calculate distances
      const users = (data || []).map(user => {
        // Safely parse location as it might be a JSON string or object
        let parsedLocation: { lat: number; lng: number } | null = null;
        if (user.location) {
          try {
            const loc = typeof user.location === 'string' 
              ? JSON.parse(user.location) 
              : user.location;
            if (loc && typeof loc === 'object' && 'lat' in loc && 'lng' in loc) {
              parsedLocation = { lat: Number(loc.lat), lng: Number(loc.lng) };
            }
          } catch (e) {
            console.warn('Failed to parse user location:', user.location);
          }
        }

        return {
          ...user,
          name: user.name || user.username || 'User',
          avatar_url: user.avatar_url || '/placeholder.svg',
          mood: user.mood || '',
          job_title: user.job_title || '',
          interests: user.interests || [],
          location: parsedLocation,
          distance_km: userLocation && parsedLocation
            ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                parsedLocation.lat,
                parsedLocation.lng
              )
            : null
        };
      });

      // Sort by distance if location is available
      if (userLocation) {
        users.sort((a, b) => {
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        });
      }

      return users;
    },
    enabled: true, // Always enabled, doesn't require location
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // refresh every 10 minutes
  });
}