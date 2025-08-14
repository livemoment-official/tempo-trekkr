import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, UserX, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FriendshipRequest {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: string;
  created_at: string;
  requester_profile?: {
    name: string;
    username: string;
    avatar_url: string;
  };
  other_profile?: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

export function FriendshipSystem() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<FriendshipRequest[]>([]);
  const [friends, setFriends] = useState<FriendshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriendshipData();
    }
  }, [user]);

  const fetchFriendshipData = async () => {
    if (!user) return;

    try {
      // Fetch pending requests where current user is the receiver
      const { data: pendingData, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('friend_user_id', user.id)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Fetch accepted friendships
      const { data: friendsData, error: friendsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${user.id},friend_user_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Fetch profile data for pending requests
      const pendingWithProfiles = await Promise.all(
        (pendingData || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, username, avatar_url')
            .eq('id', request.user_id)
            .single();
          
          return {
            ...request,
            requester_profile: profile
          };
        })
      );

      // Fetch profile data for friends
      const friendsWithProfiles = await Promise.all(
        (friendsData || []).map(async (friendship) => {
          const otherUserId = friendship.user_id === user.id ? friendship.friend_user_id : friendship.user_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, username, avatar_url')
            .eq('id', otherUserId)
            .single();
          
          return {
            ...friendship,
            other_profile: profile
          };
        })
      );

      setPendingRequests(pendingWithProfiles as any);
      setFriends(friendsWithProfiles as any);
    } catch (error) {
      console.error('Error fetching friendship data:', error);
      toast.error('Errore nel caricamento delle amicizie');
    }
  };

  const handleFriendshipRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('friendships')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success(action === 'accept' ? 'Richiesta accettata!' : 'Richiesta rifiutata');
      fetchFriendshipData();
    } catch (error) {
      console.error('Error handling friendship request:', error);
      toast.error('Errore nell\'elaborazione della richiesta');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (friendUserId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_user_id: friendUserId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Richiesta di amicizia inviata!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Errore nell\'invio della richiesta');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Richieste di amicizia ({pendingRequests.length})
            </h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.requester_profile?.avatar_url} />
                      <AvatarFallback>
                        {request.requester_profile?.name?.slice(0, 2)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.requester_profile?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{request.requester_profile?.username}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFriendshipRequest(request.id, 'accept')}
                      disabled={isLoading}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Accetta
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFriendshipRequest(request.id, 'reject')}
                      disabled={isLoading}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Rifiuta
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            I tuoi amici ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Non hai ancora amici.</p>
              <p className="text-sm">Esplora l'app per trovare persone interessanti!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {friends.map((friendship) => {
                const friend = friendship.other_profile;
                
                return (
                  <div key={friendship.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend?.avatar_url} />
                      <AvatarFallback>
                        {friend?.name?.slice(0, 2)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{friend?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{friend?.username}
                      </div>
                    </div>
                    <Badge variant="secondary">Amico</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}