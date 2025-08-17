import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useCreateInvite } from "@/hooks/useInvites";
interface InvitePreviewStepProps {
  data: any;
}
export default function InvitePreviewStep({
  data
}: InvitePreviewStepProps) {
  const { toast } = useToast();
  const createInvite = useCreateInvite();
  
  const handleSendInvites = async () => {
    try {
      console.log('Creating invite with data:', data);
      
      if (!data.activity.title || data.selectedPeople.length === 0) {
        toast({
          title: "Errore",
          description: "Attività e persone sono obbligatori",
          variant: "destructive"
        });
        return;
      }

      // Convert selectedPeople array - if they're test user IDs, use actual UUIDs
      const participantUUIDs = data.selectedPeople.map(id => {
        // Map test IDs to actual UUIDs if available
        const testUserMap = {
          '1': '11111111-1111-1111-1111-111111111111',
          '2': '22222222-2222-2222-2222-222222222222', 
          '3': '33333333-3333-3333-3333-333333333333',
          '4': '44444444-4444-4444-4444-444444444444'
        };
        
        // If it's already a UUID format, return as is
        if (id.length === 36 && id.includes('-')) {
          return id;
        }
        
        // Check if it's a test user ID
        if (testUserMap[id]) {
          return testUserMap[id];
        }
        
        // For other cases, create a mock UUID
        return `${id.padStart(8, '0')}-0000-0000-0000-000000000000`;
      });

      await createInvite.mutateAsync({
        title: data.activity.title,
        description: data.message || `Attività: ${data.activity.title}`,
        participants: participantUUIDs,
        when_at: data.date || undefined,
        place: data.location.name ? {
          name: data.location.name,
          coordinates: data.location.coordinates
        } : null
      });

      toast({
        title: "Inviti inviati!",
        description: `${data.selectedPeople.length} persone hanno ricevuto il tuo invito`
      });
      
      window.location.href = "/inviti";
    } catch (error) {
      console.error('Send invites error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare gli inviti",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Anteprima invito</h3>
        <p className="text-sm text-muted-foreground">
          Ecco come apparirà il tuo invito
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{data.activity.title === 'Caffè' ? '☕' : data.activity.title === 'Aperitivo' ? '🍷' : '🍽️'}</span>
            </div>
            <h4 className="text-xl font-bold mb-2">{data.activity.title}</h4>
            <Badge variant="secondary">{data.activity.category}</Badge>
          </div>

          {data.date && <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{format(data.date, "PPP", {
              locale: it
            })}</span>
            </div>}

          {data.location.name && <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.location.name}</span>
            </div>}

          {data.message && <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm">{data.message}</p>
            </div>}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Invitati ({data.selectedPeople.length})</span>
            </div>
            <div className="flex gap-2">
              {data.selectedPeople.map((personId: string) => <Avatar key={personId} className="w-8 h-8">
                  <AvatarFallback className="text-xs">P{personId}</AvatarFallback>
                </Avatar>)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSendInvites}
          disabled={!data.activity.title || data.selectedPeople.length === 0 || createInvite.isPending}
          className="min-w-32"
        >
          {createInvite.isPending ? "Invio..." : "Invia Inviti"}
        </Button>
      </div>
    </div>;
}