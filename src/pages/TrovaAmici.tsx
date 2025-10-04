import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, ArrowLeft, Trophy, Star, Gift } from "lucide-react";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { useAllUsers } from "@/hooks/useAllUsers";
import { UserListItem } from "@/components/profile/UserListItem";
import { FriendsSearchFilters } from "@/components/invites/FriendsSearchFilters";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { useFriendship } from "@/hooks/useFriendship";
import { usePhoneContacts } from "@/hooks/usePhoneContacts";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
export default function TrovaAmici() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/trova-amici";
  const [activeTab, setActiveTab] = useState("vicinanze");
  // Removed swipe mode - only grid mode available
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMood, setSelectedMood] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const {
    location: userLocation,
    isLoading: locationLoading
  } = useUnifiedGeolocation();

  // Get real nearby users from database
  const { data: nearbyUsers, isLoading: nearbyUsersLoading } = useNearbyUsers(
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null,
    radiusKm
  );

  // Get all users as fallback
  const { data: allUsers, isLoading: allUsersLoading } = useAllUsers(
    userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null
  );

  // Get friendship functionality
  const { sendFriendRequest, friends } = useFriendship();

  // Get phone contacts functionality
  const { syncContacts, isLoading: isSyncingContacts, contacts: phoneContacts } = usePhoneContacts();

  const usersLoading = nearbyUsersLoading || allUsersLoading;

  // Smart user selection: nearby users first, then all users as fallback
  const getDisplayUsers = () => {
    console.log('🔄 Getting display users...');
    console.log('📍 Nearby users:', nearbyUsers);
    console.log('🌐 All users:', allUsers);

    // If we have nearby users, use them
    if (nearbyUsers && nearbyUsers.length > 0) {
      console.log('✅ Using nearby users');
      const nearby = nearbyUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url || "/placeholder.svg",
        city: "Unknown",
        age: 25,
        distance_km: user.distance_km,
        is_available: true,
        preferred_moments: user.interests || []
      }));
      console.log('🎯 Transformed nearby users:', nearby);
      return nearby;
    }
    
    // Otherwise, use all users with distance calculation
    if (allUsers && allUsers.length > 0) {
      console.log('🔄 Using all users fallback');
      const all = allUsers.map(user => ({
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url,
        city: "Unknown",
        age: 25,
        distance_km: user.distance_km,
        is_available: false, // Not necessarily available
        preferred_moments: user.interests || []
      }));
      console.log('📋 Transformed all users:', all);
      return all;
    }

    console.log('⚠️ No users found');
    return [];
  };

  const transformedUsers = getDisplayUsers();

  // Filter users based on search and availability
  const filteredUsers = transformedUsers.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.preferred_moments || []).some(moment => 
        moment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesAvailability = availabilityFilter === "all" || 
      (availabilityFilter === "available" && user.is_available) || 
      (availabilityFilter === "unavailable" && !user.is_available);
    const matchesDistance = !user.distance_km || user.distance_km <= radiusKm;
    return matchesSearch && matchesAvailability && matchesDistance;
  });
  const handleFollow = async (userId: string) => {
    const success = await sendFriendRequest(userId);
    if (success) {
      const user = transformedUsers.find(u => u.id === userId);
      if (user) {
        toast.success(`Richiesta di amicizia inviata a ${user.name}!`);
      }
    }
  };

  const handleInvite = (userId: string, userName: string) => {
    // Navigate to create invite with pre-selected user
    navigate('/crea-invito', { state: { preselectedUser: userId } });
  };

  const handleSyncContacts = async () => {
    await syncContacts();
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
            
          </Card>

          <TabsContent value="vicinanze" className="space-y-4 mt-4">
            <FriendsSearchFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedMood={selectedMood} onMoodChange={setSelectedMood} radiusKm={radiusKm} onRadiusChange={setRadiusKm} availabilityFilter={availabilityFilter} onAvailabilityChange={setAvailabilityFilter} />

            {locationLoading || usersLoading ? <div className="text-center py-8">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {locationLoading ? "Ottenendo la tua posizione..." : "Cercando persone nelle vicinanze..."}
                </p>
              </div> : !userLocation ? <div className="text-center py-8">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Attiva la geolocalizzazione per trovare persone nelle vicinanze
                </p>
              </div> : filteredUsers.length === 0 ? <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery ? "Nessun risultato per la ricerca" : "Nessun utente trovato"}
                </p>
                {searchQuery && <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                    Mostra tutti
                  </Button>}
              </div> : <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredUsers.length} person{filteredUsers.length > 1 ? 'e' : 'a'} 
                    {searchQuery && ' trovate'}
                  </p>
                  {searchQuery && <Badge variant="secondary" className="text-xs">
                      {searchQuery}
                    </Badge>}
                </div>
                
                <div className="space-y-3 pb-20">
                  {filteredUsers.map(user => (
                    <div key={user.id} className="relative">
                      <UserListItem 
                        user={user} 
                        onFollow={handleFollow}
                        onInvite={handleInvite}
                      />
                      {/* Distance indicator */}
                      {user.distance_km !== undefined && user.distance_km !== null && (
                        <Badge 
                          variant={user.distance_km <= radiusKm ? "secondary" : "outline"}
                          className={`absolute top-2 right-2 text-xs ${
                            user.distance_km <= radiusKm 
                              ? "bg-green-100 text-green-700 border-green-200" 
                              : ""
                          }`}
                        >
                          {user.distance_km < 1 
                            ? `${Math.round(user.distance_km * 1000)}m` 
                            : `${user.distance_km.toFixed(1)} km`}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </>}
          </TabsContent>

          <TabsContent value="contatti" className="space-y-4 mt-4">
            {isSyncingContacts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : phoneContacts.length > 0 ? (
              <div className="space-y-2">
                {phoneContacts.map((contact) => (
                  <UserListItem
                    key={contact.id}
                    user={{
                      id: contact.id,
                      name: contact.name,
                      avatar_url: contact.avatar_url,
                      city: "Unknown",
                      age: 25,
                      distance_km: undefined,
                      is_available: false,
                      preferred_moments: []
                    }}
                    onFollow={handleFollow}
                    onInvite={handleInvite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Invita i Tuoi Contatti
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  Connetti la tua rubrica per trovare amici che usano già LiveMoment
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleSyncContacts} 
                  className="mx-auto"
                  disabled={isSyncingContacts}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {isSyncingContacts ? "Sincronizzazione..." : "Connetti Rubrica"}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}