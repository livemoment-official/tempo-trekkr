import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, MessageCircle } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function CityChat() {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isJoining, setIsJoining] = useState(false);
  
  const cityDisplayName = cityName ? 
    cityName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
    '';

  const handleJoinCityGroup = async () => {
    if (!user || !cityName) return;
    
    setIsJoining(true);
    
    // Here you would create/join the city group
    // For now, we'll show a coming soon message
    
    setTimeout(() => {
      toast({
        title: "Funzionalità in arrivo",
        description: `I gruppi città per ${cityDisplayName} saranno disponibili presto!`,
      });
      setIsJoining(false);
    }, 1000);
  };

  return (
    <AuthGuard title="Accedi per i gruppi città" description="Devi essere autenticato per accedere ai gruppi delle città">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate('/gruppi')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="font-semibold">Gruppo {cityDisplayName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Provincia di {cityDisplayName}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">
                Gruppo {cityDisplayName}
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Connettiti con persone della tua provincia. Scopri eventi, momenti e opportunità nella tua zona.
              </p>

              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Membri locali</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat di gruppo</span>
                </div>
              </div>

              <Button 
                className="rounded-xl" 
                size="lg" 
                onClick={handleJoinCityGroup}
                disabled={isJoining}
              >
                {isJoining ? "Unendosi..." : `Unisciti al gruppo ${cityDisplayName}`}
              </Button>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Cosa puoi fare:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• Trovare persone della tua zona</li>
                  <li>• Organizzare eventi locali</li>
                  <li>• Condividere momenti della tua città</li>
                  <li>• Ricevere aggiornamenti su eventi</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}