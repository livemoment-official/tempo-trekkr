import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users, Plus } from "lucide-react";
import { useMyInvites } from "@/hooks/useInvites";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import InviteCard from "@/components/invites/InviteCard";
import EnhancedNearbyUserCard from "@/components/invites/EnhancedNearbyUserCard";
import FriendsSearchFilters from "@/components/invites/FriendsSearchFilters";
import { useNavigate } from "react-router-dom";
export default function Inviti() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/inviti";
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMood, setSelectedMood] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const {
    data: inviteData,
    isLoading: invitesLoading
  } = useMyInvites();
  const {
    data: nearbyUsers = [],
    isLoading: nearbyLoading
  } = useNearbyUsers(userLocation, radiusKm);

  // Ottieni la posizione dell'utente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, error => {
        console.error('Error getting location:', error);
      });
    }
  }, []);

  // Filtra utenti vicini per ricerca e filtri
  const filteredNearbyUsers = nearbyUsers.filter(user => {
    // Filtro per testo
    const matchesSearch = searchQuery === "" || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.interests?.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtro per mood
    const matchesMood = selectedMood === "all" || user.mood === selectedMood;

    // Filtro per distanza
    const matchesDistance = user.distance_km <= radiusKm;

    // Filtro per disponibilità (per ora tutti sono disponibili, futura implementazione)
    const matchesAvailability = availabilityFilter === "all"; // TODO: implementare logica disponibilità

    return matchesSearch && matchesMood && matchesDistance && matchesAvailability;
  });
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Inviti</title>
        <meta name="description" content="Gestisci gli inviti ricevuti e inviati. Apri chat, proponi orari e crea Momenti." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inviti</h1>
        <Button onClick={() => navigate("/crea-invito")} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Invito
        </Button>
      </div>

      <Tabs defaultValue="amici">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="amici">Trova Amici</TabsTrigger>
          <TabsTrigger value="ricevuti">Ricevuti</TabsTrigger>
          <TabsTrigger value="inviati">Inviati</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ricevuti" className="space-y-4">
          {invitesLoading ? <div className="text-center py-8">
              <p className="text-muted-foreground">Caricamento inviti...</p>
            </div> : inviteData?.received.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">Nessun invito ricevuto</p>
            </div> : inviteData?.received.map(invite => <InviteCard key={invite.id} invite={invite} type="received" />)}
        </TabsContent>

        <TabsContent value="inviati" className="space-y-4">
          {invitesLoading ? <div className="text-center py-8">
              <p className="text-muted-foreground">Caricamento inviti...</p>
            </div> : inviteData?.sent.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">Nessun invito inviato</p>
            </div> : inviteData?.sent.map(invite => <InviteCard key={invite.id} invite={invite} type="sent" />)}
        </TabsContent>

        <TabsContent value="amici" className="space-y-4">
          
        </TabsContent>
      </Tabs>
    </div>;
}