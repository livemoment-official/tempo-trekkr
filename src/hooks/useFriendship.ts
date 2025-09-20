import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FriendRequest {
  id: string;
  user_id: string;
  friend_user_id: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender?: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
}

export function useFriendship() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      // Get pending friend requests where current user is the recipient
      const { data: requests, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_user_id,
          created_at,
          status
        `)
        .eq('friend_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;

      // Get sender info separately
      const requestsWithSender = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .eq('id', request.user_id)
            .single();

          return {
            ...request,
            status: request.status as 'pending' | 'accepted' | 'rejected',
            sender
          };
        })
      );

      setPendingRequests(requestsWithSender);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // Get accepted friendships
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select(`
          id,
          user_id,
          friend_user_id,
          status
        `)
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Get friend info separately
      const friendsWithInfo = await Promise.all(
        (friendships || []).map(async (friendship) => {
          const isInitiator = friendship.user_id === user.id;
          const friendId = isInitiator ? friendship.friend_user_id : friendship.user_id;
          
          const { data: friend } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .eq('id', friendId)
            .single();

          return {
            ...friendship,
            friend
          };
        })
      );

      setFriends(friendsWithInfo);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_user_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success('Richiesta di amicizia inviata');
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Errore nell\'invio della richiesta');
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success('Richiesta di amicizia accettata');
      await fetchFriendRequests();
      await fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Errore nell\'accettare la richiesta');
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      
      toast.success('Richiesta di amicizia rifiutata');
      await fetchFriendRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Errore nel rifiutare la richiesta');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;
      
      toast.success('Amicizia rimossa');
      await fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Errore nella rimozione dell\'amicizia');
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      Promise.all([
        fetchFriendRequests(),
        fetchFriends()
      ]).finally(() => setIsLoading(false));
    }
  }, [user]);

  return {
    pendingRequests,
    friends,
    isLoading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    refetch: () => {
      fetchFriendRequests();
      fetchFriends();
    }
  };
}