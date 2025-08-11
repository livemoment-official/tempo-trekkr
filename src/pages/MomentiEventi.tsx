import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, List, Filter } from "lucide-react";

function MomentCard({ title, meta }: { title: string; meta: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{meta}</div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Oggi</Badge>
          <Button size="sm">Partecipa</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MomentiEventi() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/momenti";
  const [view, setView] = useState<'list' | 'map'>('list');

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Momenti & Eventi</title>
        <meta name="description" content="Esplora Momenti ed Eventi in lista o su mappa. Filtra per giorno, categoria e distanza." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Momenti & Eventi</h1>

      <div className="flex items-center gap-2">
        <Button variant={view === 'list' ? 'default' : 'secondary'} size="sm" onClick={() => setView('list')}>
          <List /> Lista
        </Button>
        <Button variant={view === 'map' ? 'default' : 'secondary'} size="sm" onClick={() => setView('map')}>
          <MapPin /> Mappa
        </Button>
        <Button variant="outline" size="sm" className="ml-auto">
          <Filter /> Filtri
        </Button>
      </div>

      {view === 'list' ? (
        <div className="space-y-3">
          <MomentCard title="Open mic al Parco" meta="19:30 · 0.8 km · live/acustico" />
          <MomentCard title="Concerto afterwork" meta="20:00 · 2.1 km · live" />
          <MomentCard title="Picnic & chitarra" meta="Domani 18:00 · 1.7 km · acustico" />
        </div>
      ) : (
        <div className="flex h-[60vh] items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground shadow-sm">
          Mappa in arrivo · attiva la posizione per risultati migliori
        </div>
      )}
    </div>
  );
}
