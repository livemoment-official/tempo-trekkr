import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Users } from "lucide-react";
import { useMyInvites } from "@/hooks/useInvites";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import InviteCard from "@/components/invites/InviteCard";
import NearbyUserCard from "@/components/invites/NearbyUserCard";
export default function Inviti() {
  const location = useLocation();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/inviti";
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
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

  // Filtra utenti vicini per ricerca
  const filteredNearbyUsers = nearbyUsers.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.username.toLowerCase().includes(searchQuery.toLowerCase()) || user.interests?.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase())));
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Inviti</title>
        <meta name="description" content="Gestisci gli inviti ricevuti e inviati. Apri chat, proponi orari e crea Momenti." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <h1 className="text-lg font-semibold">Inviti</h1>

      <Tabs defaultValue="ricevuti">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="ricevuti">Ricevuti</TabsTrigger>
          <TabsTrigger value="inviati">Inviati</TabsTrigger>
          <TabsTrigger value="amici">Amici</TabsTrigger>
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
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input placeholder="Cerca persone disponibili..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{radiusKm}km</span>
              </div>
            </div>

            {!userLocation ? <div className="text-center py-8">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Abilita la geolocalizzazione per trovare persone vicine</p>
              </div> : nearbyLoading ? <div className="text-center py-8">
                <p className="text-muted-foreground">Cercando persone vicine...</p>
              </div> : filteredNearbyUsers.length === 0 ? <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                
                {searchQuery && <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="mt-2">
                    Mostra tutti
                  </Button>}
              </div> : <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {filteredNearbyUsers.length} person{filteredNearbyUsers.length > 1 ? 'e' : 'a'} 
                    {searchQuery && ' trovate'} disponibile{filteredNearbyUsers.length > 1 ? 'i' : ''}
                  </p>
                  {searchQuery && <Badge variant="secondary" className="text-xs">
                      {searchQuery}
                    </Badge>}
                </div>
                
                <div className="grid gap-3">
                  {filteredNearbyUsers.map(user => <NearbyUserCard key={user.user_id} user={user} />)}
                </div>
              </>}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}