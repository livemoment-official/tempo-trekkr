import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Megaphone, Users, Lock, Music, MapPin, Calendar, Clock, Euro, Star, CheckCircle2, XCircle, AlertCircle, Info, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
interface CallToActionStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}
export default function CallToActionStep({
  data,
  onChange,
  onNext
}: CallToActionStepProps) {
  // Ensure callToAction exists with defaults
  const callToAction = data.callToAction || {
    enabled: false,
    type: 'open',
    message: '',
    artistMessage: '',
    venueMessage: ''
  };
  const handleCallToActionChange = (field: string, value: any) => {
    onChange({
      ...data,
      callToAction: {
        ...callToAction,
        [field]: value
      }
    });
  };
  const hasArtists = data.selectedArtists && data.selectedArtists.length > 0;
  const hasVenues = data.selectedVenues && data.selectedVenues.length > 0;
  return <div className="space-y-6">
      {/* Header informativo */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Gestione Collaborazioni</h2>
        <p className="text-sm text-muted-foreground">Personalizza i messaggi per artisti e location selezionati.</p>
      </div>

      {/* Riepilogo selezioni */}
      {(hasArtists || hasVenues) && <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Riepilogo Collaboratori</p>
              {hasArtists && <p className="text-sm">✨ {data.selectedArtists.length} artista/i selezionato/i</p>}
              {hasVenues && <p className="text-sm">📍 {data.selectedVenues.length} location selezionata/e (prima che accetta vince!)</p>}
            </div>
          </AlertDescription>
        </Alert>}

      

      {/* Inviti Professionali - Artisti */}
      {hasArtists && <Card className="border-2 border-primary/30">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Richieste di Collaborazione - Artisti
                  <Badge variant="default" className="text-xs">Professionali</Badge>
                </CardTitle>
                <CardDescription>
                  {data.selectedArtists.length} artist{data.selectedArtists.length !== 1 ? 'i' : 'a'} riceverà una richiesta diretta di disponibilità
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messaggio per artisti */}
            <div>
              <Label htmlFor="artist-message" className="text-sm font-medium">
                Messaggio personalizzato per gli artisti
              </Label>
              <Textarea id="artist-message" value={callToAction.artistMessage || ''} onChange={e => handleCallToActionChange('artistMessage', e.target.value)} placeholder="Ciao! Stiamo organizzando questo evento e ci piacerebbe averti come ospite. Le tue performance sarebbero perfette per..." className="mt-2" rows={3} />
              <p className="text-xs text-muted-foreground mt-1">
                Questo messaggio apparirà nell'invito insieme ai dettagli dell'evento
              </p>
            </div>

            {/* Preview invito artista */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Anteprima invito artista (come apparirà nella loro app)
              </Label>
              <div className="border-2 border-primary/20 rounded-lg p-4 bg-gradient-to-b from-primary/5 to-background">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="default" className="bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    INVITO PROFESSIONALE
                  </Badge>
                  <span className="text-xs text-muted-foreground">Pinnato in alto</span>
                </div>
                
                <h4 className="font-bold text-lg mb-2">{data.title || "Titolo Evento"}</h4>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{data.when_at ? format(new Date(data.when_at), "EEEE d MMMM yyyy", {
                    locale: it
                  }) : "Data da definire"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{data.when_at ? format(new Date(data.when_at), "HH:mm", {
                    locale: it
                  }) : "Orario da definire"}</span>
                  </div>
                  {data.place?.address && <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">{data.place.address}</span>
                    </div>}
                  {data.advancedTicketing?.enabled && <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-muted-foreground" />
                      <span>Compenso artista previsto</span>
                    </div>}
                </div>

                {callToAction.artistMessage && <div className="bg-muted/50 p-3 rounded mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{callToAction.artistMessage}</p>
                    </div>
                  </div>}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Accetta
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <XCircle className="h-4 w-4 mr-1" />
                    Rifiuta
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>}

      {/* Inviti Professionali - Venue */}
      {hasVenues && <Card className="border-2 border-primary/30">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Richieste di Collaborazione - Location
                  <Badge variant="default" className="text-xs">Professionali</Badge>
                </CardTitle>
                <CardDescription>
                  {data.selectedVenues.length} location riceverà una richiesta diretta di disponibilità
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info priorità */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Le location vengono contattate in <strong>ordine di priorità</strong>. 
                La prima che accetta conferma la location per l'evento. Le altre riceveranno una notifica di esclusione.
              </AlertDescription>
            </Alert>

            {/* Messaggio per venue */}
            <div>
              <Label htmlFor="venue-message" className="text-sm font-medium">
                Messaggio personalizzato per le location
              </Label>
              <Textarea id="venue-message" value={callToAction.venueMessage || ''} onChange={e => handleCallToActionChange('venueMessage', e.target.value)} placeholder="Salve, stiamo organizzando un evento e vorremmo sapere se il vostro locale è disponibile nella data indicata..." className="mt-2" rows={3} />
              <p className="text-xs text-muted-foreground mt-1">
                Questo messaggio apparirà nella richiesta insieme ai dettagli dell'evento
              </p>
            </div>

            {/* Preview invito venue */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Anteprima richiesta location (come apparirà nella loro app)
              </Label>
              <div className="border-2 border-primary/20 rounded-lg p-4 bg-gradient-to-b from-primary/5 to-background">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="default" className="bg-primary">
                    <MapPin className="h-3 w-3 mr-1" />
                    RICHIESTA DISPONIBILITÀ
                  </Badge>
                  <span className="text-xs text-muted-foreground">Pinnato in alto</span>
                </div>
                
                <h4 className="font-bold text-lg mb-2">{data.title || "Titolo Evento"}</h4>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{data.when_at ? format(new Date(data.when_at), "EEEE d MMMM yyyy", {
                    locale: it
                  }) : "Data da definire"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{data.when_at ? format(new Date(data.when_at), "HH:mm", {
                    locale: it
                  }) : "Orario da definire"} - {data.end_at ? format(new Date(data.end_at), "HH:mm", {
                    locale: it
                  }) : "Fine da definire"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Capacità richiesta: {data.max_participants || "Da definire"} persone</span>
                  </div>
                  {hasArtists && <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-muted-foreground" />
                      <span>{data.selectedArtists.length} artist{data.selectedArtists.length !== 1 ? 'i' : 'a'} confermati</span>
                    </div>}
                </div>

                {data.description && <div className="bg-muted/50 p-3 rounded mb-3">
                    <p className="text-sm line-clamp-2">{data.description}</p>
                  </div>}

                {callToAction.venueMessage && <div className="bg-muted/50 p-3 rounded mb-4">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm">{callToAction.venueMessage}</p>
                    </div>
                  </div>}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Conferma Disponibilità
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <XCircle className="h-4 w-4 mr-1" />
                    Non Disponibile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>}

      <Separator className="my-8" />

      {/* Sezione separata per il pubblico */}
      <div className="space-y-2">
        
        
      </div>

      {/* Partecipazione Pubblica */}
      

      {/* Riepilogo */}
      {(hasArtists || hasVenues) && <Alert className="border-green-500/20 bg-green-500/5">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-green-600">Inviti pronti per l'invio</p>
              <p className="text-sm">
                Alla pubblicazione dell'evento, verranno inviati{' '}
                {hasArtists && `${data.selectedArtists.length} inviti professionali agli artisti`}
                {hasArtists && hasVenues && ' e '}
                {hasVenues && `${data.selectedVenues.length} richieste di disponibilità alle location`}.
              </p>
            </div>
          </AlertDescription>
        </Alert>}
    </div>;
}