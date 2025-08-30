import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "./useGeolocation";

interface UserPresence {
  user_id: string;
  location: { lat: number; lng: number } | null;
  last_seen: string;
  is_online: boolean;
  status?: string;
  user?: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

export function useRealTimePresence() {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const [nearbyUsers, setNearbyUsers] = useState<UserPresence[]>([]);
  const [isOnline, setIsOnline] = useState(false);

  // Update own presence
  const updatePresence = async (status?: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          location: location ? { lat: location.lat, lng: location.lng } : null,
          is_online: true,
          status,
          last_seen: new Date().toISOString()
        });

      if (!error) {
        setIsOnline(true);
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  // Set offline status
  const setOffline = async () => {
    if (!user?.id) return;

    try {
      await supabase
        .from('user_presence')
        .update({
          is_online: false,
          last_seen: new Date().toISOString()
        })
        .eq('user_id', user.id);

      setIsOnline(false);
    } catch (error) {
      console.error('Error setting offline:', error);
    }
  };

  // Load nearby users
  const loadNearbyUsers = async () => {
    try {
      // First get presence data
      const { data: presenceData, error } = await supabase
        .from('user_presence')
        .select('*')
        .eq('is_online', true)
        .neq('user_id', user?.id || '');

      if (error) throw error;
      if (!presenceData || presenceData.length === 0) {
        setNearbyUsers([]);
        return;
      }

      // Get profiles for users
      const userIds = presenceData.map(p => p.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const usersWithProfiles = presenceData.map(presence => ({
        ...presence,
        location: presence.location as { lat: number; lng: number } | null,
        user: profilesMap.get(presence.user_id) ? {
          name: profilesMap.get(presence.user_id)!.name,
          username: profilesMap.get(presence.user_id)!.username,
          avatar_url: profilesMap.get(presence.user_id)!.avatar_url
        } : undefined
      }));

      // Filter by distance if user has location
      if (location) {
        const filtered = usersWithProfiles.filter(userPresence => {
          if (!userPresence.location) return false;
          
          const distance = calculateDistance(
            location.lat,
            location.lng,
            userPresence.location.lat,
            userPresence.location.lng
          );
          
          return distance <= 10; // Within 10km
        });
        
        setNearbyUsers(filtered);
      } else {
        setNearbyUsers(usersWithProfiles);
      }
    } catch (error) {
      console.error('Error loading nearby users:', error);
    }
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Setup real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          loadNearbyUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, location]);

  // Update presence when user or location changes
  useEffect(() => {
    if (user?.id) {
      updatePresence();
      loadNearbyUsers();

      // Update presence every 30 seconds
      const interval = setInterval(() => updatePresence(), 30000);

      // Set offline on page unload
      const handleBeforeUnload = () => setOffline();
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(interval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        setOffline();
      };
    }
  }, [user?.id, location]);

  return {
    nearbyUsers,
    isOnline,
    updatePresence,
    setOffline,
    loadNearbyUsers
  };
}