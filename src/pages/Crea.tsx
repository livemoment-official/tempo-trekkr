import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, CalendarPlus, MessageSquarePlus, Users } from "lucide-react";
import { CreateGroupModal } from "@/components/create/group/CreateGroupModal";
import StandardHeader from "@/components/layout/StandardHeader";
export default function Crea() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea";
  return <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>LiveMoment · Crea</title>
        <meta name="description" content="Crea velocemente un Momento, un Evento o un Invito su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <StandardHeader 
        title="Crea" 
        onBack={() => navigate('/')}
      />

      {/* Main Content - Optimized for mobile vertical layout */}
      <div className="flex-1 px-4 py-6">
        <div className="space-y-4 max-w-sm mx-auto">
          {/* Momento Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/momento")}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">Momento</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Condividi un'esperienza vissuta
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Foto e descrizione</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Luogo e data</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evento Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/evento")}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors flex-shrink-0">
                  <CalendarPlus className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">Evento</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Organizza un evento futuro
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Data e orario</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Venue e artisti</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invito Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate("/crea/invito")}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <MessageSquarePlus className="h-6 w-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold">Invito</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crea un invito spontaneo
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Attività immediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <span>Persone nelle vicinanze</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gruppo Card */}
          <CreateGroupModal>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">Gruppo</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Crea un gruppo di interesse
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <span>Categoria e location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <span>Persone con interessi simili</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CreateGroupModal>
        </div>
      </div>
    </div>;
}