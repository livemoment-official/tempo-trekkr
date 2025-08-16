import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarPlus, MessageSquarePlus } from "lucide-react";
export default function Crea() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea";
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea</title>
        <meta name="description" content="Crea velocemente un Momento, un Evento o un Invito su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Momento Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/momento")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-left">Momento</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-left">
              Condividi un'esperienza vissuta
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Foto e descrizione</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Luogo e data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Condivisione istantanea</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Evento Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/evento")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
              <CalendarPlus className="h-8 w-8 text-secondary-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold text-left">Evento</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-left">
              Organizza un evento futuro
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Data e orario</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Venue e artisti</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Gestione partecipanti</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invito Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/invito")}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <MessageSquarePlus className="h-8 w-8 text-accent-foreground" />
            </div>
            <CardTitle className="text-lg font-semibold text-left">Invito</CardTitle>
            <p className="text-sm text-muted-foreground mt-2 text-left">
              Crea un invito spontaneo
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Attività immediata</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Persone nelle vicinanze</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>Risposta rapida</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}