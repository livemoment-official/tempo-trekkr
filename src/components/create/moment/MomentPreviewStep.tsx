import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, User, Heart } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface MomentPreviewStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function MomentPreviewStep({ data }: MomentPreviewStepProps) {
  const { toast } = useToast();

  const handlePublish = async () => {
    try {
      // TODO: Implement moment creation API call
      toast({
        title: "Momento creato!",
        description: "Il tuo momento è stato pubblicato con successo"
      });
      
      // Navigate to moments page or specific moment
      window.location.href = "/momenti";
    } catch (error) {
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