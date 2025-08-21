import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, MessageSquare, Share2, Check, X, User } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface InviteCardProps {
  invite: any;
  type: 'received' | 'sent';
}

export default function InviteCard({ invite, type }: InviteCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAccept = () => {
    toast.success(`Invito accettato! Ci vediamo da ${invite.sender?.name}`);
  };

  const handleReject = () => {
    toast.success("Invito rifiutato");
  };

  const handleViewProfile = () => {
    if (invite.sender?.id) {
      navigate(`/user/${invite.sender.id}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'postponed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accettato';
      case 'rejected': return 'Rifiutato';
      case 'postponed': return 'Rimandato';
      default: return 'In attesa';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header con utente e status */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                onClick={handleViewProfile}
              >
                <AvatarImage src={invite.sender?.avatar_url} alt={invite.sender?.name} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 
                    className="font-medium cursor-pointer hover:text-primary transition-colors"
                    onClick={handleViewProfile}
                  >
                    {invite.sender?.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    ti ha invitato a
                  </span>
                </div>
                <h3 className="font-medium text-base mt-1">{invite.title}</h3>
                {invite.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {invite.description}
                  </p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(invite.status)}>
              {getStatusText(invite.status)}
            </Badge>
          </div>

          {/* Dettagli invito */}
          <div className="space-y-2 text-sm">
            {invite.when_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(invite.when_at), "dd MMMM yyyy 'alle' HH:mm", { locale: it })}
                </span>
              </div>
            )}

            {invite.place?.name && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{invite.place.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{invite.participants?.length || 0} partecipant{(invite.participants?.length || 0) > 1 ? 'i' : 'e'}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(invite.created_at), "dd MMM", { locale: it })}
              </span>
            </div>
          </div>

          {/* Messaggio di risposta */}
          {invite.response_message && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm italic">"{invite.response_message}"</p>
            </div>
          )}

          {/* Azioni */}
          {type === 'received' && invite.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                onClick={handleAccept}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Accetta
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleReject}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Rifiuta
              </Button>
            </div>
          )}
          
          {type === 'received' && invite.status === 'pending' && (
            <Button 
              size="sm"
              variant="ghost" 
              onClick={() => setShowResponseModal(true)}
              className="w-full mt-2 text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Invia messaggio personalizzato
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}