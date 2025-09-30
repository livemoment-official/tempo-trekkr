import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return { friendsCount: 0, momentsCount: 0, age: null };

      // Count friends (accepted friendships)
      const { data: friendships, error: friendsError } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Count moments hosted by user
      const { data: moments, error: momentsError } = await supabase
        .from('moments')
        .select('id', { count: 'exact', head: true })
        .eq('host_id', userId)
        .is('deleted_at', null);

      // Age calculation removed - field not available in database
      const age = null;

      return {
        friendsCount: friendships?.length || 0,
        momentsCount: moments?.length || 0,
        age
      };
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSharedFriends(userId: string, currentUserId: string) {
  return useQuery({
    queryKey: ['shared-friends', userId, currentUserId],
    queryFn: async () => {
      if (!userId || !currentUserId || userId === currentUserId) return 0;

      // Get current user's friends
      const { data: myFriends } = await supabase
        .from('friendships')
        .select('user_id, friend_user_id')
        .or(`user_id.eq.${currentUserId},friend_user_id.eq.${currentUserId}`)
        .eq('status', 'accepted');

      const myFriendIds = new Set(
        myFriends?.map(f => 
          f.user_id === currentUserId ? f.friend_user_id : f.user_id
        ) || []
      );

      // Get target user's friends
      const { data: theirFriends } = await supabase
        .from('friendships')
        .select('user_id, friend_user_id')
        .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      const theirFriendIds = new Set(
        theirFriends?.map(f => 
          f.user_id === userId ? f.friend_user_id : f.user_id
        ) || []
      );

      // Count shared friends
      let sharedCount = 0;
      myFriendIds.forEach(id => {
        if (theirFriendIds.has(id)) sharedCount++;
      });

      return sharedCount;
    },
    enabled: !!userId && !!currentUserId && userId !== currentUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
