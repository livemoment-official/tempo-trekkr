import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarPlus, MessageSquarePlus } from "lucide-react";

export default function Crea() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/crea";

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Crea</title>
        <meta name="description" content="Crea velocemente un Momento, un Evento o un Invito su LiveMoment." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Crea</h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Cosa vuoi creare?</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Button onClick={() => navigate("/momenti")} className="justify-start">
            <Plus className="mr-2 h-4 w-4" /> Momento
          </Button>
          <Button variant="secondary" onClick={() => navigate("/momenti")} className="justify-start">
            <CalendarPlus className="mr-2 h-4 w-4" /> Evento
          </Button>
          <Button variant="outline" onClick={() => navigate("/inviti")} className="justify-start">
            <MessageSquarePlus className="mr-2 h-4 w-4" /> Invito
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
