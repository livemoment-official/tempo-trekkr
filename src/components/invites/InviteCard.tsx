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
import { useIsMobile } from "@/hooks/use-mobile";
interface InviteCardProps {
  invite: any;
  type: 'received' | 'sent';
}
export default function InviteCard({
  invite,
  type
}: InviteCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accettato';
      case 'rejected':
        return 'Rifiutato';
      case 'postponed':
        return 'Rimandato';
      default:
        return 'In attesa';
    }
  };
  return <Card className="hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <CardContent className={isMobile ? "p-4" : "p-6"}>
        {/* Status Badge - Posizionato assolutamente in alto a destra */}
        <Badge className={`absolute ${isMobile ? "top-3 right-3" : "top-4 right-4"} ${getStatusColor(invite.status)} text-xs font-medium`}>
          {getStatusText(invite.status)}
        </Badge>

        <div className={isMobile ? "space-y-4" : "space-y-6"}>
          {/* Header migliorato */}
          <div className={`flex items-start gap-${isMobile ? "3" : "4"} ${isMobile ? "pr-16" : "pr-20"}`}>
            <Avatar className={`${isMobile ? "h-10 w-10" : "h-14 w-14"} cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all ring-offset-2`} onClick={handleViewProfile}>
              <AvatarImage src={invite.sender?.avatar_url} alt={invite.sender?.name} />
              <AvatarFallback className="bg-primary/10">
                <User className={`${isMobile ? "h-4 w-4" : "h-6 w-6"} text-primary`} />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className={`font-bold ${isMobile ? "text-lg" : "text-xl"} text-foreground leading-tight`}>
                {invite.title}
              </h3>
              
              {/* Hide description on mobile */}
              {!isMobile && invite.description}
            </div>
          </div>

          {/* Dettagli organizzati in griglia - simplified on mobile */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {invite.when_at && <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">
                  {format(new Date(invite.when_at), "dd MMM yyyy", {
                locale: it
              })}
                </span>
              </div>}

            {invite.place?.name && <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{invite.place.name}</span>
              </div>}

            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>{invite.participants?.length || 0} partecipant{(invite.participants?.length || 0) > 1 ? 'i' : 'e'}</span>
            </div>

            {/* Hide "time ago" on mobile */}
            {!isMobile && <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>
                {format(new Date(invite.created_at), "dd MMM", {
                locale: it
              })}
              </span>
            </div>}
          </div>

          {/* Messaggio di risposta con stile migliorato */}
          {invite.response_message && <div className={`bg-secondary/50 border-l-4 border-primary ${isMobile ? "p-3" : "p-4"} rounded-r-lg`}>
              <p className="text-sm italic text-secondary-foreground">"{invite.response_message}"</p>
            </div>}

          {/* Azioni riprogettate */}
          {type === 'received' && invite.status === 'pending' && <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button onClick={handleAccept} className={`flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold ${isMobile ? "h-10 text-sm" : "h-11"} rounded-xl shadow-sm hover:shadow-md transition-all`}>
                  <Check className="h-4 w-4 mr-2" />
                  Accetta
                </Button>
                <Button variant="outline" onClick={handleReject} className={`flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold ${isMobile ? "h-10 text-sm" : "h-11"} rounded-xl transition-all`}>
                  <X className="h-4 w-4 mr-2" />
                  Rifiuta
                </Button>
              </div>
              
              <Button variant="ghost" onClick={() => setShowResponseModal(true)} className="w-full text-xs text-muted-foreground hover:text-foreground h-8 rounded-lg">
                <MessageSquare className="h-3 w-3 mr-2" />
                Aggiungi messaggio personalizzato
              </Button>
            </div>}
        </div>
      </CardContent>
    </Card>;
}