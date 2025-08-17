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
import { UserDiscoveryCard } from "@/components/profile/UserDiscoveryCard";
import { getRandomUserProfiles } from "@/utils/enhancedMockData";
import { toast } from "sonner";
import { FriendsSearchFilters } from "@/components/invites/FriendsSearchFilters";
import { useNavigate } from "react-router-dom";
import { useAutoGeolocation } from "@/hooks/useAutoGeolocation";
export default function Inviti() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/inviti";
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMood, setSelectedMood] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const {
    location: userLocation,
    isLoading: locationLoading
  } = useAutoGeolocation();
  const {
    data: inviteData,
    isLoading: invitesLoading
  } = useMyInvites();
  const {
    data: nearbyUsers = [],
    isLoading: nearbyLoading
  } = useNearbyUsers(userLocation, radiusKm);

  // Get mock user profiles as fallback when no real users are found
  const mockUsers = getRandomUserProfiles(12);
  const displayUsers = nearbyUsers.length > 0 ? nearbyUsers : mockUsers;

  // Transform mock users to have the right structure for UserDiscoveryCard
  const transformedUsers = mockUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
    city: user.city,
    availability: user.is_available ? "available" : "busy",
    preferred_moments: user.preferred_moments,
    age: user.age,
    distance_km: user.distance_km,
    is_available: user.is_available
  }));

  // Filtra utenti per ricerca e filtri
  const filteredUsers = transformedUsers.filter(user => {
    // Filtro per testo
    const matchesSearch = searchQuery === "" || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.city?.toLowerCase().includes(searchQuery.toLowerCase()) || user.preferred_moments?.some(moment => moment.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filtro per disponibilità
    const matchesAvailability = availabilityFilter === "all" || availabilityFilter === "available" && user.availability === "available" || availabilityFilter === "unavailable" && user.availability !== "available";

    // Filtro per distanza
    const matchesDistance = !user.distance_km || user.distance_km <= radiusKm;
    return matchesSearch && matchesAvailability && matchesDistance;
  });
  const handleInvite = (userId: string) => {
    const user = transformedUsers.find(u => u.id === userId);
    if (user) {
      toast.success(`Invito inviato a ${user.name}!`);
    }
  };
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Inviti</title>
        <meta name="description" content="Gestisci gli inviti ricevuti e inviati. Apri chat, proponi orari e crea Momenti." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      
      
      

      <Tabs defaultValue="amici">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="amici">Trova Amici</TabsTrigger>
          <TabsTrigger value="ricevuti">Tutti gli Inviti</TabsTrigger>
          
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
          <FriendsSearchFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedMood={selectedMood} onMoodChange={setSelectedMood} radiusKm={radiusKm} onRadiusChange={setRadiusKm} availabilityFilter={availabilityFilter} onAvailabilityChange={setAvailabilityFilter} />
          
          {locationLoading ? <div className="text-center py-8">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Ottenendo la tua posizione...</p>
            </div> : filteredUsers.length > 0 ? <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} person{filteredUsers.length > 1 ? 'e' : 'a'} nelle vicinanze
                </p>
                
              </div>
              <div className="grid grid-cols-2 gap-3">
                {filteredUsers.slice(0, 6).map(user => <UserDiscoveryCard key={user.id} user={user} onInvite={handleInvite} />)}
              </div>
              {filteredUsers.length > 6 && <div className="text-center">
                  <Button onClick={() => navigate("/trova-amici")} variant="outline" className="w-full">
                    Vedi altri {filteredUsers.length - 6} amici
                  </Button>
                </div>}
            </div> : <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Trova Nuovi Amici</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Nessun risultato per la ricerca" : "Scopri persone interessanti vicino a te per nuove amicizie"}
              </p>
              <Button onClick={() => navigate("/trova-amici")} className="shadow-brand">
                <Users className="h-4 w-4 mr-2" />
                Esplora Amici Nelle Vicinanze
              </Button>
            </div>}
        </TabsContent>
      </Tabs>
    </div>;
}