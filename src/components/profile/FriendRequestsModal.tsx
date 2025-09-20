import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Check, X } from 'lucide-react';
import { useFriendship } from '@/hooks/useFriendship';

interface FriendRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FriendRequestsModal({ open, onOpenChange }: FriendRequestsModalProps) {
  const { pendingRequests, acceptFriendRequest, rejectFriendRequest } = useFriendship();

  const handleAccept = async (requestId: string) => {
    await acceptFriendRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectFriendRequest(requestId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Richieste di Amicizia</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nessuna richiesta in sospeso</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.sender?.avatar_url} />
                  <AvatarFallback>
                    {request.sender?.name?.charAt(0) || request.sender?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {request.sender?.name || request.sender?.username}
                  </div>
                  {request.sender?.username && request.sender?.name && (
                    <div className="text-xs text-muted-foreground">
                      @{request.sender.username}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(request.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}