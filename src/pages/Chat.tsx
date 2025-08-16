import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Send, MapPin, UserPlus, MessageSquare } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationList } from "@/components/chat/ConversationList";

const chips = [
  "Aperitivo live",
  "Open mic",
  "Chill al parco",
  "Concerto vicino",
  "Cerca un’artista",
  "Trova location",
];

function PersonaCard({ name, tag }: { name: string; tag: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <Avatar>
          <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{tag}</div>
        </div>
        <div className="flex gap-2">
          <AuthGuard 
            title="Accedi per scrivere"
            description={`Accedi per iniziare una conversazione con ${name}`}
          >
            <Button variant="secondary" size="sm" aria-label={`Scrivi a ${name}`}>
              <MessageSquare />
              <span className="sr-only">Scrivi</span>
            </Button>
          </AuthGuard>
          <AuthGuard 
            title="Accedi per invitare"
            description={`Accedi per invitare ${name} ad un momento`}
          >
            <Button size="sm" aria-label={`Invita ${name}`}>
              <UserPlus />
              <span className="sr-only">Invita</span>
            </Button>
          </AuthGuard>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleCard({ title, meta }: { title: string; meta: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{meta}</div>
        </div>
        <AuthGuard 
          title="Accedi per partecipare"
          description="Accedi per vedere i dettagli e partecipare"
        >
          <Button variant="outline" size="sm">
            <MapPin /> Partecipa
          </Button>
        </AuthGuard>
      </CardContent>
    </Card>
  );
}

export default function Chat() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/";

  return (
    <div className="space-y-6">
      <Helmet>
        <title>LiveMoment · CioCiPT – Cosa facciamo oggi?</title>
        <meta name="description" content="Canta o scrivi il tuo mood: CioCiPT ti propone persone, artisti, location e Momenti vicini a te." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="sr-only">CioCiPT – Assistente LiveMoment</h1>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <img src="/lovable-uploads/226af222-cb67-49c4-b2d9-a7d1ee44345e.png" alt="Logo LiveMoment" className="h-8 w-auto" />
          <p className="text-sm text-muted-foreground">Cosa facciamo oggi? Puoi anche canticchiare 🎤</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <Button key={c} variant="chip" className="hover-scale">
              {c}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card p-2 shadow-sm">
          <Button variant="secondary" size="icon" aria-label="Input vocale">
            <Mic />
          </Button>
          <Input placeholder="Descrivi un’idea o canta il mood…" className="border-0 focus-visible:ring-0" />
          <Button size="icon" aria-label="Invia">
            <Send />
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Persone compatibili vicino a te</CardTitle>
        </CardHeader>
        <div className="space-y-2">
          <PersonaCard name="Giorgia" tag="Chill · 1 km" />
          <PersonaCard name="Luca" tag="Open mic · 0.6 km" />
          <PersonaCard name="Marta" tag="Aperitivo live · 1.2 km" />
        </div>
      </section>

      <section className="space-y-2">
        <CardHeader className="p-0">
          <CardTitle className="text-base">Artisti e Location suggerite</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SimpleCard title="Duo acustico – Luna" meta="Disponibile stasera · 2 km" />
          <SimpleCard title="Bar con palco – Aurora" meta="Posti 60 · 1.5 km" />
        </div>
      </section>

      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="discover">Scopri</TabsTrigger>
          <TabsTrigger value="messages">Messaggi</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover" className="space-y-4">
          <section className="rounded-xl border p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary">Oggi</Badge>
              <span className="text-sm font-medium">Momenti & Eventi vicini</span>
            </div>
            <div className="space-y-2">
              <SimpleCard title="Open mic al Parco" meta="19:30 · 0.8 km · live/acustico" />
              <SimpleCard title="Concerto afterwork" meta="20:00 · 2.1 km · live" />
            </div>
          </section>
        </TabsContent>
        
        <TabsContent value="messages">
          <ConversationList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
