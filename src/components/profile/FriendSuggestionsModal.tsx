import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileCard } from "@/components/profile/UserProfileCard";
import { useNearbyUsers } from "@/hooks/useNearbyUsers";
import { Search, MapPin, Users, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface FriendSuggestionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock data per i contatti dalla rubrica
const mockContacts = [
  {
    id: "contact1",
    name: "Marco Rossi",
    username: "marco_rossi",
    phone: "+39 333 123 4567",
    avatar_url: null,
    bio: null,
    personality_type: null,
    job_title: "Designer",
    mood: "Creativo",
    interests: ["Design", "Arte"],
    followers_count: 45,
    following_count: 23,
    is_verified: false,
    instagram_username: null,
    chat_permission: "everyone"
  },
  {
    id: "contact2", 
    name: "Sofia Bianchi",
    username: "sofia_b",
    phone: "+39 333 987 6543",
    avatar_url: null,
    bio: "Amante della natura e dello sport",
    personality_type: "ENFP",
    job_title: "Personal Trainer",
    mood: "Energica",
    interests: ["Sport", "Natura", "Fotografia"],
    followers_count: 120,
    following_count: 89,
    is_verified: true,
    instagram_username: "sofia_fitness",
    chat_permission: "followers_only"
  }
];

export const FriendSuggestionsModal = ({ open, onOpenChange }: FriendSuggestionsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 45.4642, lng: 9.1900 // Milano come default
  });

  const { data: nearbyUsers, isLoading } = useNearbyUsers(userLocation, 10);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNearbyUsers = nearbyUsers?.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Trova amici
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Tabs defaultValue="nearby" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nearby" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Nelle vicinanze
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Rubrica
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Cerca
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nearby" className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Entro 10 km
                </Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNearbyUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredNearbyUsers.map((user) => (
                    <UserProfileCard
                      key={user.user_id}
                      profile={{
                        id: user.user_id,
                        name: user.name,
                        username: user.username,
                        avatar_url: user.avatar_url,
                        bio: null,
                        personality_type: null,
                        job_title: user.job_title,
                        mood: user.mood,
                        interests: user.interests,
                        followers_count: 0,
                        following_count: 0,
                        is_verified: false,
                        instagram_username: null,
                        chat_permission: "everyone"
                      }}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nessun utente trovato nelle vicinanze
                </p>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Contatti che usano LiveMoment
                </p>
                <Button variant="outline" size="sm">
                  Sincronizza contatti
                </Button>
              </div>
              
              {filteredContacts.length > 0 ? (
                <div className="space-y-3">
                  {filteredContacts.map((contact) => (
                    <UserProfileCard
                      key={contact.id}
                      profile={contact}
                      compact
                      onFollow={() => console.log('Follow', contact.id)}
                      onMessage={() => console.log('Message', contact.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nessun contatto trovato su LiveMoment
                </p>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                Cerca utenti per nome, username o interessi
              </p>
              
              {searchQuery ? (
                <div className="space-y-3">
                  {/* Mock search results */}
                  <p className="text-center text-muted-foreground py-8">
                    Risultati di ricerca per "{searchQuery}"...
                  </p>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Inizia a digitare per cercare utenti
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};