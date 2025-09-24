import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, AlertCircle, Loader2 } from "lucide-react";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";

export function LocationPermissionCard() {
  const { 
    location, 
    permission, 
    isLoading, 
    error, 
    requestLocation, 
    formatDistance 
  } = useUnifiedGeolocation();

  if (permission === 'granted' && location) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-3 p-4">
          <Navigation className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Posizione attiva</p>
            <p className="text-xs text-muted-foreground">
              Precisione: {location.accuracy ? formatDistance(location.accuracy / 1000) : 'N/A'}
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <MapPin className="h-3 w-3 mr-1" />
            Attiva
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Geolocalizzazione negata</p>
            <p className="text-xs text-muted-foreground">
              Abilita la posizione nelle impostazioni del browser per vedere eventi vicini
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Riprova
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'prompt' || isLoading) {
    return (
      <Card className="bg-accent/5 border-accent/20">
        <CardContent className="flex items-center gap-3 p-4">
          <Navigation className="h-5 w-5 text-accent-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isLoading ? 'Rilevamento posizione...' : 'Attiva la geolocalizzazione'}
            </p>
            <p className="text-xs text-muted-foreground">
              {error ? error : 'Permetti l\'accesso alla tua posizione per trovare eventi e persone vicine'}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={requestLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : 'Attiva'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}