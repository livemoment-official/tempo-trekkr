import { useQuery } from "@tanstack/react-query";
import { generateMockUsers } from "@/utils/mockData";
import { supabase } from "@/integrations/supabase/client";

interface NearbyUser {
  id: string; // Changed from user_id to id for consistency
  name: string;
  username: string;
  avatar_url: string;
  mood: string;
  distance_km: number;
  availability_id: string;
  job_title: string;
  interests: string[];
}

interface UserLocation {
  lat: number;
  lng: number;
}

export function useNearbyUsers(
  userLocation: UserLocation | null,
  radiusKm: number = 5.0,
  targetTime?: Date
) {
  return useQuery({
    queryKey: ['nearby-users', userLocation, radiusKm, targetTime],
    queryFn: async (): Promise<NearbyUser[]> => {
      if (!userLocation) {
        return [];
      }

      const { data, error } = await supabase.rpc('get_nearby_available_users', {
        user_lat: userLocation.lat,
        user_lng: userLocation.lng,
        radius_km: radiusKm,
        target_time: targetTime?.toISOString() || new Date().toISOString()
      });

      if (error) {
        console.error('Error fetching nearby users:', error);
        throw error;
      }

      // Transform user_id to id for consistency with other hooks
      const transformedData = (data || []).map(user => ({
        ...user,
        id: user.user_id // Map user_id to id for consistent navigation
      }));
      
      console.log('🌍 Nearby users transformed:', transformedData);
      
      return transformedData;
    },
    enabled: !!userLocation,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // refresh every 5 minutes
  });
}

export function useInviteCount(targetUserId: string) {
  return useQuery({
    queryKey: ['invite-count', targetUserId],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('count_user_invites_today', {
        target_user_id: targetUserId
      });

      if (error) {
        console.error('Error fetching invite count:', error);
        throw error;
      }

      return data || 0;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}