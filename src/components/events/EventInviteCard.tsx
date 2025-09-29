import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EventInvitation } from "@/hooks/useEventInvitations";
import { Calendar, MapPin, User, Clock, MessageSquare, Check, X, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface EventInviteCardProps {
  invitation: EventInvitation;
  onUpdate: (params: {
    invitationId: string;
    status: 'accepted' | 'rejected';
    responseMessage?: string;
    isArtist: boolean;
  }) => void;
  showActions?: boolean;
}

export function EventInviteCard({ invitation, onUpdate, showActions = true }: EventInviteCardProps) {
  const { user } = useAuth();
  const [responseMessage, setResponseMessage] = useState("");
  const [isResponseOpen, setIsResponseOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'accepted' | 'rejected' | null>(null);

  const event = invitation.events;
  const isArtistInvitation = 'artist_id' in invitation; // This helps determine table type

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return <Badge variant="outline" className="text-amber-600 border-amber-600">In Attesa</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-600">Accettato</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rifiutato</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleResponse = (status: 'accepted' | 'rejected') => {
    setPendingAction(status);
    if (status === 'rejected') {
      setIsResponseOpen(true);
    } else {
      onUpdate({
        invitationId: invitation.id,
        status,
        responseMessage: responseMessage || undefined,
        isArtist: isArtistInvitation,
      });
    }
  };

  const submitResponse = () => {
    if (pendingAction) {
      onUpdate({
        invitationId: invitation.id,
        status: pendingAction,
        responseMessage: responseMessage || undefined,
        isArtist: isArtistInvitation,
      });
      setIsResponseOpen(false);
      setPendingAction(null);
      setResponseMessage("");
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold mb-2">{event.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(invitation.status)}
              <span className="text-sm text-muted-foreground">
                Invitato il {format(new Date(invitation.invited_at), "dd MMM yyyy", { locale: it })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {event.when_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(event.when_at), "dd MMM yyyy 'alle' HH:mm", { locale: it })}</span>
            </div>
          )}
        </div>

        {event.place && (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.place.name || event.place.address}</span>
          </div>
        )}

        {invitation.invitation_message && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Messaggio dell'organizzatore:</span>
            </div>
            <p className="text-sm italic">"{invitation.invitation_message}"</p>
          </div>
        )}

        {invitation.response_message && (
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">La tua risposta:</span>
            </div>
            <p className="text-sm">"{invitation.response_message}"</p>
          </div>
        )}
      </CardContent>

      {showActions && invitation.status === 'invited' && (
        <CardFooter className="pt-0">
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleResponse('rejected')}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Rifiuta
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleResponse('accepted')}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Accetta
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Response Dialog */}
      <Dialog open={isResponseOpen} onOpenChange={setIsResponseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'accepted' ? 'Accetta Invito' : 'Rifiuta Invito'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">
                Messaggio per l'organizzatore {pendingAction === 'rejected' ? '(opzionale)' : ''}
              </Label>
              <Textarea
                id="response"
                placeholder={
                  pendingAction === 'accepted' 
                    ? "Sono entusiasta di partecipare a questo evento..."
                    : "Grazie per l'invito, purtroppo non posso partecipare perché..."
                }
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsResponseOpen(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button 
                onClick={submitResponse}
                className="flex-1"
                variant={pendingAction === 'rejected' ? 'destructive' : 'default'}
              >
                {pendingAction === 'accepted' ? 'Accetta' : 'Rifiuta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}