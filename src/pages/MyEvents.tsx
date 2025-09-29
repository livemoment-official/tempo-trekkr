import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEventInvitations } from "@/hooks/useEventInvitations";
import { EventInviteCard } from "@/components/events/EventInviteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User } from "lucide-react";

export default function MyEvents() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  
  const { invitations, isLoading, updateInvitation } = useEventInvitations();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Accedi per visualizzare i tuoi eventi</p>
      </div>
    );
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'invited');
  const acceptedInvitations = invitations.filter(inv => inv.status === 'accepted');
  const rejectedInvitations = invitations.filter(inv => inv.status === 'rejected');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">I Miei Eventi</h1>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">I Miei Eventi</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Inviti Ricevuti
            {pendingInvitations.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {pendingInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Confermati
            {acceptedInvitations.length > 0 && (
              <Badge variant="default" className="text-xs">
                {acceptedInvitations.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            Storia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun invito in sospeso</h3>
              <p className="text-muted-foreground">I nuovi inviti per eventi appariranno qui</p>
            </div>
          ) : (
            pendingInvitations.map((invitation) => (
              <EventInviteCard
                key={invitation.id}
                invitation={invitation}
                onUpdate={updateInvitation}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedInvitations.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun evento confermato</h3>
              <p className="text-muted-foreground">Gli eventi che hai accettato appariranno qui</p>
            </div>
          ) : (
            acceptedInvitations.map((invitation) => (
              <EventInviteCard
                key={invitation.id}
                invitation={invitation}
                onUpdate={updateInvitation}
                showActions={false}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessuna storia</h3>
              <p className="text-muted-foreground">La cronologia degli eventi rifiutati apparirà qui</p>
            </div>
          ) : (
            rejectedInvitations.map((invitation) => (
              <EventInviteCard
                key={invitation.id}
                invitation={invitation}
                onUpdate={updateInvitation}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}