import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, MessageSquare, Share2, Check, X, User, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
interface InviteCardProps {
  invite: any;
  type: 'received' | 'sent';
  onAccept?: (inviteId: string) => void;
  onReject?: (inviteId: string) => void;
  onCreateMoment?: (inviteId: string) => void;
}
export default function InviteCard({
  invite,
  type,
  onAccept,
  onReject,
  onCreateMoment
}: InviteCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const handleAccept = () => {
    onAccept?.(invite.id);
  };
  const handleReject = () => {
    onReject?.(invite.id);
  };
  const handleCreateMoment = () => {
    if (onCreateMoment) {
      onCreateMoment(invite.id);
    } else {
      navigate(`/crea/momento-da-invito/${invite.id}`);
    }
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
        return 'bg-white text-gray-700 border-gray-200';
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
            
            <div className="flex-1 space-y-2">
              <div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span 
                    onClick={handleViewProfile} 
                    className={`font-medium cursor-pointer hover:text-primary transition-colors text-xs`}
                  >
                    {invite.sender?.name}
                  </span>
                  <span className={`text-muted-foreground text-xs`}>
                    ti ha invitato a:
                  </span>
                </div>
                <h3 className={`font-bold text-foreground ${isMobile ? "text-base" : "text-lg"} leading-tight mt-1`}>
                  {invite.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Dettagli organizzati in griglia - simplified on mobile */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {invite.when_at && <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">
                  {format(new Date(invite.when_at), "dd MMM yyyy, HH:mm", {
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

          {/* Azioni per inviti ricevuti */}
          {type === 'received' && (
            <div className="space-y-3 pt-2">
              {/* Bottoni principali */}
              <div className="flex gap-3">
                <Button onClick={handleCreateMoment} className={`flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold ${isMobile ? "h-11 text-sm" : "h-12"} rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]`}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Crea il Momento
                </Button>
                
                <Button onClick={() => navigate(`/chat/private/${invite.sender?.id}`)} variant="outline" className={`${isMobile ? "border border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 font-medium h-11 px-3" : "border-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 font-medium h-12 px-5"} rounded-xl transition-all`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {isMobile ? "Chat" : "Chatta"}
                </Button>
              </div>
              
              {/* Bottoni secondari - solo per inviti pending */}
              {invite.status === 'pending' && (
                <div className="flex gap-3">
                  <Button onClick={handleAccept} variant="outline" className={`flex-1 border-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 font-medium ${isMobile ? "h-9 text-xs" : "h-10 text-sm"} rounded-lg transition-all`}>
                    <Check className="h-4 w-4 mr-2" />
                    Accetta
                  </Button>
                  <Button onClick={handleReject} variant="outline" size="sm" className={`px-3 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium ${isMobile ? "h-9" : "h-10"} rounded-lg transition-all`}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>;
}