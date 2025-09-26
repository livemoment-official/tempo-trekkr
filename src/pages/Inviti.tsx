import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users, Plus, LayoutGrid, Heart } from "lucide-react";
import { useMyInvites, useUpdateInviteStatus } from "@/hooks/useInvites";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import InviteCard from "@/components/invites/InviteCard";
import { InviteSwipeInterface } from "@/components/invites/InviteSwipeInterface";
import { UserDiscoveryCard } from "@/components/profile/UserDiscoveryCard";
import { SwipeInterface } from "@/components/profile/SwipeInterface";
import { toast } from "sonner";
import { FriendsSearchFilters } from "@/components/invites/FriendsSearchFilters";
import { useNavigate } from "react-router-dom";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAllUsers } from "@/hooks/useAllUsers";
import { QuickInviteModal } from "@/components/invites/QuickInviteModal";
import { cn } from "@/lib/utils";
export default function Inviti() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/inviti";
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMood, setSelectedMood] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [inviteViewMode, setInviteViewMode] = useState<"swipe" | "list">("list");
  const [friendsViewMode, setFriendsViewMode] = useState<"swipe" | "list">("list");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const {
    location: userLocation,
    isLoading: locationLoading
  } = useUnifiedGeolocation();
  const {
    data: inviteData,
    isLoading: invitesLoading
  } = useMyInvites();
  const updateInviteStatus = useUpdateInviteStatus();

  // Transform invites to include sender info for SwipeInterface
  const {
    data: transformedInvites,
    isLoading: transformingInvites
  } = useQuery({
    queryKey: ['invites-with-senders', inviteData],
    queryFn: async () => {
      if (!inviteData?.received) return [];
      const invitesWithSenders = await Promise.all(inviteData.received.map(async invite => {
        const {
          data: hostProfile
        } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', invite.host_id).maybeSingle();
        return {
          ...invite,
          sender: {
            id: invite.host_id,
            name: hostProfile?.name || 'Utente',
            avatar_url: hostProfile?.avatar_url
          }
        };
      }));
      return invitesWithSenders;
    },
    enabled: !!inviteData?.received
  });
  const {
    data: nearbyUsers = [],
    isLoading: nearbyLoading
  } = useNearbyUsers(userLocation, radiusKm);

  // Get all users as fallback
  const {
    data: allUsers = [],
    isLoading: allUsersLoading
  } = useAllUsers(userLocation);

  // Use nearby users first, then all users as fallback
  const displayUsers = nearbyUsers.length > 0 ? nearbyUsers : allUsers.slice(0, 12);

  // Transform users to have the right structure for UserDiscoveryCard
  const transformedUsers = displayUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url || '/placeholder.svg',
    city: "Milano", // Simplified to avoid build errors - could implement reverse geocoding later
    // Could be extracted from location if needed
    availability: user.distance_km !== null ? "available" : "busy",
    preferred_moments: user.interests || [],
    age: 25,
    // Mock age since it's not in the database
    distance_km: user.distance_km,
    is_available: user.distance_km !== null
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

  // Transform users for SwipeInterface (matches SwipeUser interface)
  const swipeUsers = filteredUsers.map(user => ({
    id: user.id,
    name: user.name,
    avatar_url: user.avatar_url,
    city: user.city,
    is_available: user.is_available,
    preferred_moments: user.preferred_moments,
    age: user.age,
    distance_km: user.distance_km
  }));
  const handleInvite = (userId: string, userName?: string) => {
    const user = transformedUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser({
        id: user.id,
        name: user.name,
        username: user.name.toLowerCase().replace(/\s+/g, ''),
        avatar_url: user.avatar_url,
        mood: '',
        distance_km: user.distance_km || 0,
        availability_id: '',
        job_title: '',
        interests: user.preferred_moments || []
      });
      setInviteModalOpen(true);
    }
  };
  const handlePass = (userId: string) => {
    const user = transformedUsers.find(u => u.id === userId);
    if (user) {
      toast(`Hai saltato ${user.name}`, {
        description: "Non vedrai più questo profilo"
      });
    }
  };
  const handleAcceptInvite = (inviteId: string) => {
    const allInvites = [...(inviteData?.received || []), ...(inviteData?.sent || [])];
    const invite = allInvites.find(i => i.id === inviteId);
    if (invite) {
      updateInviteStatus.mutate({
        inviteId,
        status: 'accepted',
        responseMessage: 'Accettato!'
      });
    }
  };
  const handleRejectInvite = (inviteId: string) => {
    const allInvites = [...(inviteData?.received || []), ...(inviteData?.sent || [])];
    const invite = allInvites.find(i => i.id === inviteId);
    if (invite) {
      updateInviteStatus.mutate({
        inviteId,
        status: 'rejected',
        responseMessage: 'Non posso partecipare.'
      });
    }
  };
  return <div className="min-h-screen bg-background space-y-4 pb-20">
      <Helmet>
        <title>LiveMoment · Inviti</title>
        <meta name="description" content="Gestisci gli inviti ricevuti e inviati. Apri chat, proponi orari e crea Momenti." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      
      
      

      <Tabs defaultValue="ricevuti" className="px-4">
        <TabsList className={cn("grid grid-cols-2 w-full", isMobile ? "mb-3" : "mb-6")}>
          <TabsTrigger value="ricevuti" className={cn("font-medium", isMobile ? "text-xs px-2 py-1.5" : "text-sm")}>
            Inviti Ricevuti
          </TabsTrigger>
          <TabsTrigger value="amici" className={cn("font-medium", isMobile ? "text-xs px-2 py-1.5" : "text-sm")}>
            Invita
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ricevuti" className="space-y-6">
          {/* Toggle between swipe and list view for invites */}
          

          {invitesLoading || transformingInvites ? <div className="text-center py-12">
              <p className="text-muted-foreground">Caricamento inviti...</p>
            </div> : <>
              {/* Swipe Interface for Invites */}
              {inviteViewMode === "swipe" ? <div className="h-[calc(100vh-280px)] min-h-[600px] relative">
                  <InviteSwipeInterface invites={(transformedInvites || []).filter(invite => invite.status === 'pending')} onAccept={handleAcceptInvite} onReject={handleRejectInvite} />
                </div> : (/* List View for Invites */
          <div className="space-y-4">
                  {(inviteData?.received || []).length === 0 ? <div className="text-center py-12">
                      <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Nessun invito</h3>
                      <p className="text-muted-foreground">
                        Non hai inviti in attesa al momento.
                      </p>
                    </div> : <>
                      <div className={cn("flex items-center justify-between", isMobile ? "mb-2" : "mb-4")}>
                        <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                          {(inviteData?.received || []).filter(i => i.status === 'pending').length} inviti in attesa
                        </p>
                        <Badge variant="secondary" className={isMobile ? "text-xs px-2 py-0.5" : ""}>
                          {(inviteData?.received || []).length} totali
                        </Badge>
                      </div>
                      {(inviteData?.received || []).map(invite => {
                // Transform invite to include sender info
                const transformedInvite = transformedInvites?.find(t => t.id === invite.id) || invite;
                return <InviteCard key={invite.id} invite={transformedInvite} type="received" onAccept={handleAcceptInvite} onReject={handleRejectInvite} />;
              })}
                    </>}
                </div>)}
            </>}
        </TabsContent>

        <TabsContent value="amici" className="space-y-6">
          <div className="flex items-center justify-between">
            
            
            {/* Toggle between list and swipe view for friends */}
            
          </div>

          {/* Only show filters when not in swipe mode on mobile */}
          {!(isMobile && friendsViewMode === "swipe") && <FriendsSearchFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} selectedMood={selectedMood} onMoodChange={setSelectedMood} radiusKm={radiusKm} onRadiusChange={setRadiusKm} availabilityFilter={availabilityFilter} onAvailabilityChange={setAvailabilityFilter} />}
          
          {locationLoading || nearbyLoading || allUsersLoading ? <div className="text-center py-12">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Caricamento utenti...</p>
            </div> : filteredUsers.length > 0 ? <>
              {/* Swipe Interface for Friends */}
              {friendsViewMode === "swipe" ? <div className="h-[calc(100vh-280px)] min-h-[600px] relative">
                  <SwipeInterface users={swipeUsers} onInvite={handleInvite} onPass={handlePass} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                </div> : (/* List View for Friends */
          <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                      {filteredUsers.length} person{filteredUsers.length > 1 ? 'e' : 'a'} nelle vicinanze
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredUsers.slice(0, 6).map(user => <UserDiscoveryCard key={user.id} user={user} onInvite={handleInvite} />)}
                  </div>
                  {filteredUsers.length > 6 && <div className="text-center pt-4">
                      <Button onClick={() => navigate("/trova-amici")} variant="outline" className="w-full">
                        Vedi altri {filteredUsers.length - 6} amici
                      </Button>
                    </div>}
                </div>)}
            </> : <div className="text-center py-12">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Trova Nuovi Amici</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {searchQuery ? "Nessun risultato per la ricerca" : "Scopri persone interessanti vicino a te per nuove amicizie"}
              </p>
              <Button onClick={() => navigate("/trova-amici")} className="shadow-md">
                <Users className="h-4 w-4 mr-2" />
                Esplora Amici Nelle Vicinanze
              </Button>
            </div>}
        </TabsContent>
      </Tabs>

      {/* Quick Invite Modal */}
      {selectedUser && <QuickInviteModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} targetUser={selectedUser} />}
    </div>;
}