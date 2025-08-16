import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, X, Users, MapPin } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/utils";
import { CreateGroupModal } from "@/components/create/group/CreateGroupModal";

// Province italiane
const provincieItaliane = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", "Bari", "Barletta-Andria-Trani",
  "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi", "Cagliari", "Caltanissetta",
  "Campobasso", "Carbonia-Iglesias", "Caserta", "Catania", "Catanzaro", "Chieti", "Como", "Cosenza", "Cremona", "Crotone",
  "Cuneo", "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", "Frosinone", "Genova", "Gorizia", "Grosseto",
  "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco", "Livorno", "Lodi", "Lucca", "Macerata",
  "Mantova", "Massa-Carrara", "Matera", "Medio Campidano", "Messina", "Milano", "Modena", "Monza e Brianza", "Napoli",
  "Novara", "Nuoro", "Ogliastra", "Olbia-Tempio", "Oristano", "Padova", "Palermo", "Parma", "Pavia", "Perugia", "Pesaro e Urbino",
  "Pescara", "Piacenza", "Pisa", "Pistoia", "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria",
  "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno", "Sassari", "Savona", "Siena", "Siracusa", "Sondrio",
  "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento", "Treviso", "Trieste", "Udine", "Varese", "Venezia",
  "Verbano-Cusio-Ossola", "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo"
];

// Mock data per gruppi creati dagli utenti
const mockGruppiUtenti = [
  {
    id: "1",
    emoji: "🍔",
    title: "Aperitivi Milano",
    participants: 500,
    location: "Milano",
    category: "aperitivo"
  },
  {
    id: "2", 
    emoji: "🎉",
    title: "Feste in Casa",
    participants: 5,
    location: "Milano",
    category: "festa"
  },
  {
    id: "3",
    emoji: "🥃",
    title: "Drink Easy",
    participants: 30,
    location: "Milano, Live Moment House",
    category: "drink"
  }
];

// Mock data per chat con amici
const mockChatAmici = [
  {
    id: "1",
    name: "Marco Rossi",
    avatar: "👨‍💼",
    lastMessage: "Ci vediamo stasera?",
    time: "10:30",
    unread: 2
  },
  {
    id: "2",
    name: "Giulia Bianchi", 
    avatar: "👩‍🎨",
    lastMessage: "Perfetto! A che ora?",
    time: "9:15",
    unread: 0
  }
];

// Mock data per chat momenti
const mockChatMomenti = [
  {
    id: "1",
    title: "Picnic sul prato!",
    participants: 15,
    lastMessage: "Portate qualcosa da bere!",
    time: "11:45",
    unread: 3
  }
];

const GroupInfoModal = ({ trigger }: { trigger: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Come Funzionano i Gruppi di Live Moment</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 pt-4">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Puoi creare massimo 2 Gruppi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Puoi partecipare in soli 5 gruppi contemporaneamente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ogni gruppo è Geo-localizzato.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Ogni gruppo ha un'Interesse specifico.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Nei gruppi inviti a Momenti persone con passioni specifiche.</span>
                </li>
              </ul>
              <AuthGuard 
                title="Accedi per creare gruppi"
                description="Accedi per creare e partecipare ai gruppi"
                fallback={
                  <Button className="w-full mt-6 rounded-xl" size="lg" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Accedi per Creare un Gruppo
                  </Button>
                }
              >
                <CreateGroupModal>
                  <Button className="w-full mt-6 rounded-xl" size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Crea il Gruppo
                  </Button>
                </CreateGroupModal>
              </AuthGuard>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const GroupCard = ({ group, type = "user" }: { 
  group: any; 
  type?: "user" | "city" | "friend" | "moment" 
}) => {
  const navigate = useNavigate();
  if (type === "city") {
    return (
      <Card className="mb-3">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{group}</h3>
              <p className="text-sm text-muted-foreground">Gruppo della provincia</p>
            </div>
          </div>
          <AuthGuard fallback={
            <Button variant="outline" size="sm" disabled>
              Accedi
            </Button>
          }>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={() => navigate(`/chat/city/${group.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              Entra
            </Button>
          </AuthGuard>
        </CardContent>
      </Card>
    );
  }

  if (type === "friend") {
    return (
      <Card className="mb-3">
        <CardContent 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(`/chat/friend/${group.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
              {group.avatar}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-sm text-muted-foreground">{group.lastMessage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{group.time}</p>
            {group.unread > 0 && (
              <Badge variant="default" className="mt-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {group.unread}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "moment") {
    return (
      <Card className="mb-3">
        <CardContent 
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(`/chat/moment/${group.id}`)}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{group.title}</h3>
              <p className="text-sm text-muted-foreground">{group.lastMessage}</p>
              <p className="text-xs text-muted-foreground">{group.participants} partecipanti</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{group.time}</p>
            {group.unread > 0 && (
              <Badge variant="default" className="mt-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {group.unread}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default user group
  return (
    <Card className="mb-3">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
            {group.emoji}
          </div>
          <div>
            <h3 className="font-semibold">{group.title}</h3>
            <p className="text-sm text-primary">{group.participants} Partecipanti</p>
            <p className="text-sm text-muted-foreground">{group.location}</p>
          </div>
        </div>
        <AuthGuard fallback={
          <Button variant="outline" size="sm" disabled>
            Accedi
          </Button>
        }>
          <Button size="sm" className="rounded-xl">
            Iscriviti
          </Button>
        </AuthGuard>
      </CardContent>
    </Card>
  );
};

export default function Gruppi() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('gruppi-banner-dismissed') !== 'true';
  });

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('gruppi-banner-dismissed', 'true');
  };

  const filteredProvince = provincieItaliane.filter(provincia =>
    provincia.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGruppi = mockGruppiUtenti.filter(gruppo =>
    gruppo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gruppi - LiveMoment</title>
        <meta name="description" content="Unisciti ai gruppi di LiveMoment per condividere momenti e esperienze con persone che condividono i tuoi interessi." />
        <link rel="canonical" href={`https://livemoment.app${location.pathname}`} />
      </Helmet>

      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">Chat</h1>
        <CreateGroupModal>
          <Button size="icon" variant="outline" className="rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
        </CreateGroupModal>
      </header>

      <div className="p-4">
        <Tabs defaultValue="gruppi" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="gruppi" className="text-xs">I tuoi Gruppi</TabsTrigger>
            <TabsTrigger value="citta" className="text-xs">Città</TabsTrigger>
            <TabsTrigger value="amici" className="text-xs">Amici</TabsTrigger>
            <TabsTrigger value="momenti" className="text-xs">Momenti</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="gruppi" className="space-y-4">
            {showBanner && (
              <Card className="bg-muted/50 border-2 border-dashed border-primary/30 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={dismissBanner}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Come Funzionano i Gruppi di Live Moment</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Puoi creare massimo 2 Gruppi.</li>
                    <li>• Puoi partecipare in soli 5 gruppi contemporaneamente.</li>
                    <li>• Ogni gruppo è Geo-localizzato.</li>
                    <li>• Ogni gruppo ha un'Interesse specifico.</li>
                    <li>• Nei gruppi inviti a Momenti persone con passioni specifiche.</li>
                  </ul>
                  <CreateGroupModal>
                    <Button className="rounded-xl">
                      <Plus className="mr-2 h-4 w-4" />
                      Crea un Gruppo
                    </Button>
                  </CreateGroupModal>
                </CardContent>
              </Card>
            )}

            {filteredGruppi.map((gruppo) => (
              <GroupCard key={gruppo.id} group={gruppo} type="user" />
            ))}
          </TabsContent>

          <TabsContent value="citta" className="space-y-4">
            {filteredProvince.slice(0, 10).map((provincia) => (
              <GroupCard key={provincia} group={provincia} type="city" />
            ))}
            {filteredProvince.length > 10 && (
              <p className="text-center text-sm text-muted-foreground">
                Mostrando le prime 10 province. Usa la ricerca per trovarne altre.
              </p>
            )}
          </TabsContent>

          <TabsContent value="amici" className="space-y-4">
            {mockChatAmici.map((amico) => (
              <GroupCard key={amico.id} group={amico} type="friend" />
            ))}
          </TabsContent>

          <TabsContent value="momenti" className="space-y-4">
            {mockChatMomenti.map((momento) => (
              <GroupCard key={momento.id} group={momento} type="moment" />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}