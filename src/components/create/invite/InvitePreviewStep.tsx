import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface InvitePreviewStepProps {
  data: any;
}

export default function InvitePreviewStep({ data }: InvitePreviewStepProps) {
  const { toast } = useToast();

  const handleSendInvites = async () => {
    try {
      toast({
        title: "Inviti inviati!",
        description: `${data.selectedPeople.length} persone hanno ricevuto il tuo invito`
      });
      window.location.href = "/inviti";
    } catch (error) {
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare gli inviti",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
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

          {data.date && (
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{format(data.date, "PPP", { locale: it })}</span>
            </div>
          )}

          {data.location.name && (
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.location.name}</span>
            </div>
          )}

          {data.message && (
            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <p className="text-sm">{data.message}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Invitati ({data.selectedPeople.length})</span>
            </div>
            <div className="flex gap-2">
              {data.selectedPeople.map((personId: string) => (
                <Avatar key={personId} className="w-8 h-8">
                  <AvatarFallback className="text-xs">P{personId}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSendInvites} className="bg-primary">
          Invia Inviti
        </Button>
      </div>
    </div>
  );
}