import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, Heart } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MomentPreviewStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function MomentPreviewStep({ data }: MomentPreviewStepProps) {
  const { toast } = useToast();

  const handlePublish = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Errore",
          description: "Devi essere autenticato per creare un momento",
          variant: "destructive"
        });
        return;
      }

      // Combine date and time if provided
      let when_at = null;
      if (data.date) {
        when_at = data.date;
        if (data.time) {
          const [hours, minutes] = data.time.split(':');
          when_at.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
      }

      // Upload photos if they are new blobs
      let photoUrls = data.photos || [];
      if (data.photos && data.photos.length > 0) {
        const uploadPromises = data.photos.map(async (photo: string) => {
          if (photo.startsWith('blob:')) {
            // Convert blob URL to file and upload
            const response = await fetch(photo);
            const blob = await response.blob();
            const file = new File([blob], `moment-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            
            const fileName = `${user.id}/moment-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('galleries')
              .upload(fileName, file);

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage
              .from('galleries')
              .getPublicUrl(fileName);
              
            return publicUrl;
          }
          return photo; // Return existing URL
        });
        
        photoUrls = await Promise.all(uploadPromises);
      }

      // Prepare moment data
      const momentData = {
        title: data.title,
        description: data.description || '',
        photos: photoUrls,
        when_at: when_at?.toISOString(),
        place: data.location?.name ? {
          name: data.location.name,
          coordinates: data.location.coordinates
        } : null,
        host_id: user.id,
        participants: [],
        max_participants: data.capacity,
        capacity: data.capacity,
        mood_tag: data.moodTag,
        tags: data.tags || [],
        is_public: true,
        age_range_min: data.ageRange?.min || 18,
        age_range_max: data.ageRange?.max || 65,
        ticketing: data.ticketing
      };

      // Insert moment into database
      const { data: createdMoment, error } = await supabase
        .from('moments')
        .insert([momentData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Momento creato! 🎉",
        description: "Il tuo momento è stato pubblicato con successo"
      });
      
      // Navigate to the created moment
      window.location.href = `/momento/${createdMoment.id}`;
    } catch (error) {
      console.error('Error creating moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Anteprima del momento</h3>
        <p className="text-sm text-muted-foreground">
          Ecco come apparirà il tuo momento agli altri utenti
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Photos */}
          {data.photos.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {data.photos.slice(0, 6).map((photo: string, index: number) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
              {data.photos.length > 6 && (
                <p className="text-sm text-muted-foreground mt-2">
                  +{data.photos.length - 6} altre foto
                </p>
              )}
            </div>
          )}

          {/* Title and description */}
          <div className="mb-4">
            <h4 className="text-xl font-bold mb-2">{data.title}</h4>
            {data.description && (
              <p className="text-muted-foreground">{data.description}</p>
            )}
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Date and location */}
          <div className="space-y-2 mb-4">
            {data.date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(data.date, "PPP", { locale: it })}</span>
              </div>
            )}
            {data.location.name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{data.location.name}</span>
              </div>
            )}
          </div>

          {/* User info (mock) */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Il tuo profilo</p>
                <p className="text-xs text-muted-foreground">Adesso</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Informazioni aggiuntive</h4>
        <p className="text-sm text-muted-foreground">
          Le informazioni del tuo profilo (età, mood) verranno automaticamente associate al momento per migliorare i suggerimenti agli altri utenti.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handlePublish} className="bg-primary">
          Pubblica Momento
        </Button>
      </div>
    </div>
  );
}