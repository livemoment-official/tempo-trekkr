import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, MessageSquare, Share2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface InviteCardProps {
  invite: any;
  type: 'received' | 'sent';
}

export default function InviteCard({ invite, type }: InviteCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const { user } = useAuth();

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
          {/* Header con titolo e status */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-base">{invite.title}</h3>
              {invite.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invite.description}
                </p>
              )}
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
            <Button 
              size="sm" 
              onClick={() => setShowResponseModal(true)}
              className="mt-2 w-full"
            >
              Rispondi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}