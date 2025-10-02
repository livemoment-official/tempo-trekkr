import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useUserLocation } from "@/hooks/useUserLocation";

interface InvitePreviewStepProps {
  data: any;
}
export default function InvitePreviewStep({
  data
}: InvitePreviewStepProps) {
  const userLocation = useUserLocation();
  const { data: users } = useAllUsers(
    userLocation.getUserLocation ? null : { lat: 0, lng: 0 }
  );

  // Get selected users details
  const selectedUsers = users?.filter(user => 
    data.selectedPeople.includes(user.id)
  ) || [];

  // Get activity emoji
  const getActivityEmoji = (title: string) => {
    const emojiMap: Record<string, string> = {
      'Caffè': '☕',
      'Aperitivo': '🍷',
      'Cena': '🍽️',
      'Shopping': '🛍️',
      'Fotografia': '📸',
      'Concerto': '🎵',
    };
    return emojiMap[title] || '';
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Anteprima invito</h3>
        <p className="text-sm text-muted-foreground">
          Verifica i dettagli prima di inviare
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">{getActivityEmoji(data.activity.title)}</span>
            </div>
            <h4 className="text-2xl font-bold mb-2">{data.activity.title}</h4>
            <Badge variant="secondary" className="text-sm">
              {data.activity.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {data.date && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {format(data.date, "EEEE d MMMM yyyy", { locale: it })}
                </p>
                {data.time && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {data.time}
                  </p>
                )}
              </div>
            </div>
          )}

          {data.location.name && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{data.location.name}</p>
            </div>
          )}

          {data.message && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium mb-1">Messaggio:</p>
              <p className="text-sm text-muted-foreground italic">"{data.message}"</p>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold">
                Persone invitate ({selectedUsers.length})
              </span>
            </div>
            
            {selectedUsers.length > 0 ? (
              <div className="space-y-2">
                {selectedUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                      <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name || user.username}</p>
                      {user.job_title && (
                        <p className="text-xs text-muted-foreground">{user.job_title}</p>
                      )}
                    </div>
                    {user.distance_km != null && (
                      <Badge variant="outline" className="text-xs">
                        {user.distance_km.toFixed(1)}km
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nessuna persona selezionata
              </p>
            )}
          </div>

          {!data.date && !data.location.name && (
            <div className="text-center py-4 border-t">
              <p className="text-sm text-muted-foreground">
                💡 Suggerimento: Aggiungi data e luogo per un invito più completo
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}