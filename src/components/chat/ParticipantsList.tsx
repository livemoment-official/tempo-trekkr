import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  avatar_url?: string;
  username?: string;
}

interface ParticipantsListProps {
  isOpen: boolean;
  onClose: () => void;
  participantIds: string[];
  hostId: string;
  title: string;
  type: 'moment' | 'group' | 'event';
  onInviteMore?: () => void;
}

export function ParticipantsList({ 
  isOpen, 
  onClose, 
  participantIds, 
  hostId, 
  title,
  type,
  onInviteMore 
}: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && participantIds.length > 0) {
      loadParticipants();
    }
  }, [isOpen, participantIds]);

  const loadParticipants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, username')
        .in('id', participantIds);

      if (error) throw error;

      // Sort participants: host first, then alphabetically
      const sortedParticipants = data?.sort((a, b) => {
        if (a.id === hostId) return -1;
        if (b.id === hostId) return 1;
        return (a.name || '').localeCompare(b.name || '');
      }) || [];

      setParticipants(sortedParticipants);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare i partecipanti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'moment': return 'momento';
      case 'group': return 'gruppo';
      case 'event': return 'evento';
      default: return 'chat';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Partecipanti
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {participants.length} {participants.length === 1 ? 'membro' : 'membri'} in questo {getTypeLabel()}
          </p>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>
                    {participant.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {participant.name || 'Utente'}
                    </p>
                    {participant.id === hostId && (
                      <Badge variant="secondary" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                  {participant.username && (
                    <p className="text-sm text-muted-foreground truncate">
                      @{participant.username}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {onInviteMore && (
          <div className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                onInviteMore();
                onClose();
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invita altre persone
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}