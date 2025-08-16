import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const InviteCard = ({
  title,
  from,
  when
}: {
  title: string;
  from: string;
  when: string;
}) => <Card className="shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      Da {from} · {when}
    </CardContent>
    <CardFooter className="gap-2">
      <Button size="sm">Accetta</Button>
      <Button variant="secondary" size="sm">Proponi orario</Button>
      <Button variant="outline" size="sm">Rifiuta</Button>
    </CardFooter>
  </Card>;
export default function Inviti() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/inviti";
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Inviti</title>
        <meta name="description" content="Gestisci gli inviti ricevuti e inviati. Apri chat, proponi orari e crea Momenti." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Inviti</h1>

      <Tabs defaultValue="ricevuti">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="ricevuti">Ricevuti</TabsTrigger>
          <TabsTrigger value="inviati">Inviati</TabsTrigger>
          
          <TabsTrigger value="amici">Amici</TabsTrigger>
        </TabsList>
        <TabsContent value="ricevuti" className="space-y-3">
          <InviteCard title="Aperitivo live" from="Giorgia" when="Oggi 19:00" />
          <InviteCard title="Open mic" from="Luca" when="Domani 20:00" />
        </TabsContent>
        <TabsContent value="inviati" className="space-y-3">
          <InviteCard title="Chill al parco" from="Tu → Marta" when="Oggi 18:30" />
        </TabsContent>
        <TabsContent value="attesa" className="space-y-3">
          <Card className="shadow-sm">
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nessun invito in attesa. Chiedi all'AI di crearne uno!
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="amici" className="space-y-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trova amici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Cerca per nome o @username" aria-label="Cerca amici" />
              <div className="text-sm text-muted-foreground">
                Suggerimenti nelle vicinanze appariranno qui.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}