import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, ExternalLink, Share2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Invite, useUpdateInviteStatus, useTransformToMoment } from "@/hooks/useInvites";
import InviteResponseModal from "./InviteResponseModal";

interface InviteCardProps {
  invite: Invite;
  type: 'received' | 'sent';
}

export default function InviteCard({ invite, type }: InviteCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState<'accepted' | 'rejected' | 'postponed'>('accepted');
  
  const updateStatus = useUpdateInviteStatus();
  const transformToMoment = useTransformToMoment();

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

  const handleResponse = (type: 'accepted' | 'rejected' | 'postponed') => {
    setResponseType(type);
    setShowResponseModal(true);
  };

  const confirmResponse = async (message?: string) => {
    await updateStatus.mutateAsync({
      inviteId: invite.id,
      status: responseType,
      responseMessage: message
    });
    setShowResponseModal(false);
  };

  const handleTransformToMoment = async () => {
    await transformToMoment.mutateAsync(invite.id);
  };

  return (
    <>
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
                <span>{invite.participants.length} partecipant{invite.participants.length > 1 ? 'i' : 'e'}</span>
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
            <div className="flex gap-2 pt-2">
              {type === 'received' && invite.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleResponse('accepted')}
                    disabled={updateStatus.isPending}
                    className="flex-1"
                  >
                    Accetta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse('postponed')}
                    disabled={updateStatus.isPending}
                  >
                    Rimanda
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse('rejected')}
                    disabled={updateStatus.isPending}
                  >
                    Rifiuta
                  </Button>
                </>
              )}

              {type === 'received' && invite.status === 'accepted' && (
                <Button
                  size="sm"
                  onClick={handleTransformToMoment}
                  disabled={transformToMoment.isPending}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Rendi Pubblico
                </Button>
              )}

              {type === 'sent' && (
                <div className="text-sm text-muted-foreground">
                  Inviti inviati: {invite.invite_count}/3
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <InviteResponseModal
        open={showResponseModal}
        onOpenChange={setShowResponseModal}
        invite={invite}
        responseType={responseType}
        onConfirm={confirmResponse}
      />
    </>
  );
}