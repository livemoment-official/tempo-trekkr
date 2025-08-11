import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

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
    </div>
  );
}
