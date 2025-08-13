import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
export default function Profilo() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/profilo";

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Profilo</title>
        <meta name="description" content="Gestisci identità, disponibilità, preferenze e notifiche del tuo profilo." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Profilo</h1>

      <Card className="shadow-sm">
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>LM</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">LiveMoment User</div>
            <div className="text-sm text-muted-foreground">@username</div>
          </div>
          <Button variant="secondary" size="sm">Modifica</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Disponibile oggi sera</div>
              <div className="text-sm text-muted-foreground">18:00 – 22:00</div>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Interessi</div>
            <div className="flex flex-wrap gap-2">
              {['live', 'acustico', 'aperitivo', 'open mic'].map((x) => (
                <Badge key={x} variant="secondary">{x}</Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Notifiche</div>
              <div className="text-sm text-muted-foreground">Inviti, chat, conferme</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Social & Galleria</div>
            <div className="flex items-center gap-2">
              <Input placeholder="@instagram" aria-label="Instagram username" />
              <Button variant="secondary" size="sm">Collega</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="aspect-square rounded-md bg-muted" aria-label={`Slot immagine ${i}`} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <div className="text-sm font-medium">Mood</div>
              <Input placeholder="Es. Chill, Energico…" />
            </div>
            <div>
              <div className="text-sm font-medium">Lavoro</div>
              <Input placeholder="Job title" />
            </div>
            <div>
              <div className="text-sm font-medium">Relazione</div>
              <Input placeholder="Es. Single, In coppia…" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
