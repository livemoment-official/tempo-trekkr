import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, Users, Music, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { it } from "date-fns/locale";
interface EventPreviewStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function EventPreviewStep({
  data
}: EventPreviewStepProps) {
  const {
    toast
  } = useToast();
  const handlePublish = async () => {
    try {
      if (!data.title || !data.date) {
        toast({
          title: "Errore",
          description: "Titolo e data sono obbligatori",
          variant: "destructive"
        });
        return;
      }

      // Combine date and time
      let when_at = null;
      if (data.date && data.startTime) {
        const [hours, minutes] = data.startTime.split(':');
        const eventDate = new Date(data.date);
        eventDate.setHours(parseInt(hours), parseInt(minutes));
        when_at = eventDate.toISOString();
      }

      // Upload photos if any
      const photoUrls = [];
      for (const photo of data.photos || []) {
        if (typeof photo === 'string' && photo.startsWith('blob:')) {
          const response = await fetch(photo);
          const blob = await response.blob();
          const file = new File([blob], `event-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          const {
            data: {
              user
            }
          } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          const fileExt = file.name.split('.').pop();
          const fileName = `events/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const {
            error: uploadError
          } = await supabase.storage.from('galleries').upload(fileName, file);
          if (uploadError) throw uploadError;
          const {
            data: {
              publicUrl
            }
          } = supabase.storage.from('galleries').getPublicUrl(fileName);
          photoUrls.push(publicUrl);
        } else if (typeof photo === 'string') {
          photoUrls.push(photo);
        }
      }

      // Create event
      const {
        error
      } = await supabase.from('events').insert({
        title: data.title,
        description: data.description,
        when_at,
        place: data.location.name ? {
          name: data.location.name,
          coordinates: data.location.coordinates
        } : null,
        max_participants: data.capacity,
        photos: photoUrls,
        tags: data.tags,
        mood_tag: data.tags[0],
        ticketing: data.ticketing,
        registration_status: data.callToAction.type === 'invite_only' ? 'invite_only' : 'open'
      });
      if (error) throw error;
      toast({
        title: "Evento creato!",
        description: "Il tuo evento è stato pubblicato con successo"
      });
      window.location.href = "/momenti";
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare l'evento",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Anteprima dell'evento</h3>
        <p className="text-sm text-muted-foreground">
          Verifica tutti i dettagli prima di pubblicare l'evento
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Event basic info */}
          <div>
            <h4 className="text-xl font-bold mb-2">{data.title}</h4>
            {data.description && <p className="text-muted-foreground mb-4">{data.description}</p>}
            
            {/* Tags */}
            {data.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                {data.tags.map((tag: string) => <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>)}
              </div>}
          </div>

          {/* Date and location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {data.date && <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(data.date, "PPP", {
                locale: it
              })}</span>
                {data.startTime && <span>alle {data.startTime}</span>}
              </div>}
            
            {data.location.name && <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{data.location.name}</span>
              </div>}
          </div>

          {/* Event details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.capacity && <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Capacità: {data.capacity} persone</span>
              </div>}
            
            {data.ticketing && <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">A pagamento</Badge>
                <span>€{data.ticketing.price}</span>
              </div>}
          </div>

          {/* Selected artists */}
          {data.selectedArtists.length > 0 && <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Music className="h-4 w-4" />
                Artisti invitati ({data.selectedArtists.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.selectedArtists.map((artistId: string) => <div key={artistId} className="bg-muted/50 p-2 rounded flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Artista ID: {artistId}</span>
                  </div>)}
              </div>
            </div>}

          {/* Selected venues */}
          {data.selectedVenues.length > 0 && <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Location contattate ({data.selectedVenues.length})
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {data.selectedVenues.map((venueId: string) => <div key={venueId} className="bg-muted/50 p-2 rounded flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Venue ID: {venueId}</span>
                  </div>)}
              </div>
            </div>}

          {/* Call to action */}
          {data.callToAction.enabled && <div>
              <h5 className="font-medium mb-3">Call-to-Action</h5>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={data.callToAction.type === 'open' ? 'default' : 'secondary'}>
                    {data.callToAction.type === 'open' ? 'Evento Aperto' : 'Solo su Invito'}
                  </Badge>
                </div>
                {data.callToAction.message && <p className="text-sm">{data.callToAction.message}</p>}
              </div>
            </div>}

          {/* Host info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Organizzato da te</p>
                <p className="text-xs text-muted-foreground">Host dell'evento</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Cosa succederà dopo</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Gli artisti e le location selezionate riceveranno una notifica</li>
          <li>• L'evento sarà visibile agli utenti secondo le tue impostazioni</li>
          <li>• Potrai gestire partecipazioni e modificare dettagli</li>
          {data.callToAction.enabled && <li>• Gli utenti potranno rispondere al tuo call-to-action</li>}
        </ul>
      </div>

      <div className="flex justify-end">
        
      </div>
    </div>;
}