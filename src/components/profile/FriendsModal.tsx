import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Check, X, MessageCircle, UserMinus, Users } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';
import { useNavigate } from 'react-router-dom';

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMetricsRefetch?: () => void;
}

export function FriendsModal({ open, onOpenChange, onMetricsRefetch }: FriendsModalProps) {
  const navigate = useNavigate();
  const { pendingRequests, friends, acceptFriendRequest, rejectFriendRequest, removeFriend } = useFriendship();

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    onMetricsRefetch?.();
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    await removeFriend(friendshipId);
    onMetricsRefetch?.();
  };

  const handleOpenChat = (friendId: string) => {
    navigate(`/chat?user=${friendId}`);
    onOpenChange(false);
  };

  const handleViewProfile = (friendId: string) => {
    navigate(`/user/${friendId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Amici</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends" className="relative">
              Amici
              {friends.length > 0 && (
                <span className="ml-1.5 text-xs text-muted-foreground">({friends.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Richieste
              {pendingRequests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab Amici */}
          <TabsContent value="friends" className="space-y-4 mt-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nessun amico ancora</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {friends.map((friendship) => (
                  <div 
                    key={friendship.id} 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewProfile(friendship.friend.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friendship.friend?.avatar_url} />
                      <AvatarFallback>
                        {friendship.friend?.name?.charAt(0) || friendship.friend?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {friendship.friend?.name || friendship.friend?.username}
                      </div>
                      {friendship.friend?.username && friendship.friend?.name && (
                        <div className="text-xs text-muted-foreground truncate">
                          @{friendship.friend.username}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenChat(friendship.friend.id)}
                        className="h-8 w-8 p-0"
                        title="Apri chat"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFriend(friendship.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Rimuovi amicizia"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab Richieste */}
          <TabsContent value="requests" className="space-y-4 mt-4">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Nessuna richiesta in sospeso</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.sender?.avatar_url} />
                      <AvatarFallback>
                        {request.sender?.name?.charAt(0) || request.sender?.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {request.sender?.name || request.sender?.username}
                      </div>
                      {request.sender?.username && request.sender?.name && (
                        <div className="text-xs text-muted-foreground truncate">
                          @{request.sender.username}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request.id)}
                        className="h-8 w-8 p-0"
                        title="Rifiuta"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                        className="h-8 w-8 p-0"
                        title="Accetta"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
