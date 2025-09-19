import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, ArrowLeft, Trophy, Star, Gift, Grid3X3, LayoutGrid, Heart } from "lucide-react";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { UserListItem } from "@/components/profile/UserListItem";
import { FriendsSearchFilters } from "@/components/invites/FriendsSearchFilters";
import { SwipeInterface } from "@/components/profile/SwipeInterface";
import { useAutoGeolocation } from "@/hooks/useAutoGeolocation";
import { getRandomUserProfiles } from "@/utils/enhancedMockData";
import { toast } from "sonner";
export default function TrovaAmici() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/trova-amici";
  const [activeTab, setActiveTab] = useState("vicinanze");
  const [viewMode, setViewMode] = useState<"swipe" | "grid">("swipe");
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
    const matchesSearch = searchQuery === "" || user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.city.toLowerCase().includes(searchQuery.toLowerCase()) || user.preferred_moments?.some(moment => moment.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAvailability = availabilityFilter === "all" || availabilityFilter === "available" && user.is_available || availabilityFilter === "unavailable" && !user.is_available;
    const matchesDistance = !user.distance_km || user.distance_km <= radiusKm;
    return matchesSearch && matchesAvailability && matchesDistance;
  });
  const handleFollow = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      toast.success(`Ora segui ${user.name}!`);
    }
  };

  const handleInvite = (userId: string, userName: string) => {
    toast.success(`Invito inviato a ${userName}!`);
  };

  const handlePass = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      toast(`Hai saltato ${user.name}`, { 
        description: "Non vedrai più questo profilo"
      });
    }
  };
  return <div className="min-h-screen bg-[#FFFCEF]">
      <Helmet>
        <title>LiveMoment · Trova Amici</title>
        <meta name="description" content="Trova persone interessanti vicino a te per nuove amicizie e momenti da condividere." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Header */}
      

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="vicinanze" className="data-[state=active]:bg-background">
              Vicinanze
            </TabsTrigger>
            <TabsTrigger value="contatti" className="data-[state=active]:bg-background">
              Contatti
            </TabsTrigger>
          </TabsList>

          {/* Gamification Banner */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-200/50 cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => navigate('/premi')}>
            <div className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Guadagna Premi Invitando Amici!
                </h3>
                <p className="text-sm text-muted-foreground">Invita 3 amici = +30 punti
Segui 10 Persone = +50 punti
Crea 1 Momento = +100 punti
Crea 1 Gruppo con almeno 15 Persone = +150 punti</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <Gift className="h-4 w-4 text-orange-500" />
              </div>
            </div>
          </Card>

          <TabsContent value="vicinanze" className="space-y-4 mt-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "swipe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("swipe")}
                  className="h-8"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  Swipe
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8"
                >
                  <LayoutGrid className="h-3 w-3 mr-1" />
                  Griglia
                </Button>
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length} persone
              </Badge>
            </div>

            {viewMode === "swipe" ? (
              // Swipe Mode - Dating App Style
              locationLoading ? (
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
                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                      Mostra tutti
                    </Button>
                  )}
                </div>
              ) : (
                <div className="h-[600px] relative">
                  <SwipeInterface
                    users={filteredUsers}
                    onInvite={handleInvite}
                    onPass={handlePass}
                  />
                </div>
              )
            ) : (
              // Grid Mode - Traditional List
              <>
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
                      <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
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
                    
                    <div className="space-y-3 pb-20">
                      {filteredUsers.map(user => (
                        <UserListItem key={user.id} user={user} onFollow={handleFollow} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="contatti" className="space-y-4 mt-4">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Invita i Tuoi Contatti
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Connetti la tua rubrica per trovare amici che usano già LiveMoment
              </p>
              <Button variant="outline" onClick={() => toast.info("Funzionalità in arrivo!")} className="mx-auto">
                Connetti Rubrica
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}