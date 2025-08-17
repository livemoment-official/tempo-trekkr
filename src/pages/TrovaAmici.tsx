import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, ArrowLeft } from "lucide-react";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { UserDiscoveryCard } from "@/components/profile/UserDiscoveryCard";
import { FriendsSearchFilters } from "@/components/invites/FriendsSearchFilters";
import { useAutoGeolocation } from "@/hooks/useAutoGeolocation";
import { getRandomUserProfiles } from "@/utils/enhancedMockData";
import { toast } from "sonner";

export default function TrovaAmici() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/trova-amici";
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMood, setSelectedMood] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  
  const {
    location: userLocation,
    isLoading: locationLoading
  } = useAutoGeolocation();
  
  // Get mock user profiles for a more populated experience
  const mockUsers = getRandomUserProfiles(15);
  
  // Filtra utenti per ricerca e filtri
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.preferred_moments?.some(moment => moment.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAvailability = availabilityFilter === "all" || 
      (availabilityFilter === "available" && user.is_available) ||
      (availabilityFilter === "unavailable" && !user.is_available);

    const matchesDistance = !user.distance_km || user.distance_km <= radiusKm;

    return matchesSearch && matchesAvailability && matchesDistance;
  });

  const handleInvite = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      toast.success(`Invito inviato a ${user.name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFCEF]">
      <Helmet>
        <title>LiveMoment · Trova Amici</title>
        <meta name="description" content="Trova persone interessanti vicino a te per nuove amicizie e momenti da condividere." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-[#FFFCEF]/85 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">Trova Amici</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        <FriendsSearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedMood={selectedMood}
          onMoodChange={setSelectedMood}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          availabilityFilter={availabilityFilter}
          onAvailabilityChange={setAvailabilityFilter}
        />

        {locationLoading ? (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Ottenendo la tua posizione...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nessun risultato per la ricerca" : "Nessuno disponibile nelle vicinanze al momento"}
            </p>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Mostra tutti
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredUsers.length} person{filteredUsers.length > 1 ? 'e' : 'a'} 
                {searchQuery && ' trovate'} nelle vicinanze
              </p>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  {searchQuery}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3 pb-20">
              {filteredUsers.map(user => (
                <UserDiscoveryCard 
                  key={user.id} 
                  user={user} 
                  onInvite={handleInvite}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}