import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Plus, X, Users, MapPin, Loader2, MoreVertical, ChevronRight } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/utils";
import { GroupManagementModal } from "@/components/groups/GroupManagementModal";
import { useGroups } from "@/hooks/useGroups";
import { useMomentChats } from "@/hooks/useMomentChats";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCityGroups } from "@/hooks/useCityGroups";

// Province italiane
const provincieItaliane = ["Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", "Bari", "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia", "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Carbonia-Iglesias", "Caserta", "Catania", "Catanzaro", "Chieti", "Como", "Cosenza", "Cremona", "Crotone", "Cuneo", "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", "Frosinone", "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco", "Livorno", "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera", "Medio Campidano", "Messina", "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara", "Nuoro", "Ogliastra", "Olbia-Tempio", "Oristano", "Padova", "Palermo", "Parma", "Pavia", "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa", "Pistoia", "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria", "Reggio Emilia", "Rieti", "Rimini", "Roma", "Rovigo", "Salerno", "Sassari", "Savona", "Siena", "Siracusa", "Sondrio", "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento", "Treviso", "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli", "Verona", "Vibo Valentia", "Vicenza", "Viterbo"];

// Emoji per categorie
const categoryEmojis: Record<string, string> = {
  "aperitivo": "🍹",
  "festa": "🎉", 
  "drink": "🥃",
  "cibo": "🍔",
  "sport": "⚽",
  "musica": "🎵",
  "arte": "🎨",
  "viaggio": "✈️",
  "natura": "🌳",
  "tecnologia": "💻",
  "moment_chat": "💬",
  "default": "👥"
};

const GroupInfoModal = ({
  trigger
}: {
  trigger: React.ReactNode;
}) => {
  return <Dialog>
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
              <AuthGuard title="Accedi per creare gruppi" description="Accedi per creare e partecipare ai gruppi" fallback={<Button className="w-full mt-6 rounded-xl" size="lg" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Accedi per Creare un Gruppo
                  </Button>}>
                <Button className="w-full mt-6 rounded-xl" size="lg" onClick={() => window.location.href = '/crea/gruppo'}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crea il Gruppo
                </Button>
              </AuthGuard>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>;
};
const GroupCard = ({
  group,
  type = "user",
  onJoin,
  onLeave,
  isJoining = false,
  isLeaving = false,
  currentUserId,
  cityGroupsMap
}: {
  group: any;
  type?: "user" | "city" | "friend" | "moment";
  onJoin?: (groupId: string) => Promise<void>;
  onLeave?: (groupId: string) => Promise<void>;
  isJoining?: boolean;
  isLeaving?: boolean;
  currentUserId?: string;
  cityGroupsMap?: Map<string, any>;
}) => {
  const navigate = useNavigate();
  if (type === "city") {
    const cityData = cityGroupsMap?.get(group);
    const participantCount = cityData?.participant_count || 0;
    
    return <Card className="mb-3">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{group}</h3>
              <p className="text-sm text-muted-foreground">
                {participantCount} {participantCount === 1 ? 'partecipante' : 'partecipanti'}
              </p>
            </div>
          </div>
          <AuthGuard fallback={<Button variant="outline" size="sm" disabled>
              Accedi
            </Button>}>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/chat/city/${group.toLowerCase().replace(/\s+/g, '-')}`)}>
              Entra
            </Button>
          </AuthGuard>
        </CardContent>
      </Card>;
  }
  if (type === "friend") {
    return <Card className="mb-3">
        <CardContent className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/chat/friend/${group.id}`)}>
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
            {group.unread > 0 && <Badge variant="default" className="mt-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {group.unread}
              </Badge>}
          </div>
        </CardContent>
      </Card>;
  }
  if (type === "moment") {
    return <Card className="mb-3">
        <CardContent className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/chat/moment/${group.id}`)}>
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
            {group.unread > 0 && <Badge variant="default" className="mt-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {group.unread}
              </Badge>}
          </div>
        </CardContent>
      </Card>;
  }

  // Default user group
  const isHost = currentUserId === group.host_id;
  const isParticipant = group.participants?.includes(currentUserId);
  const participantCount = Array.isArray(group.participants) ? group.participants.length : 0;
  const emoji = categoryEmojis[group.category] || categoryEmojis.default;
  const locationName = group.location?.name || group.location || "Posizione non specificata";
  
  // FASE 5: Format last message time
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };

  return <Card className="mb-3">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0 relative">
            {group.avatar_url ? (
              <img src={group.avatar_url} alt={group.title} className="w-full h-full rounded-full object-cover" />
            ) : (
              emoji
            )}
            {group.unread_count && group.unread_count > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {group.unread_count}
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{group.title}</h3>
            {group.last_message && (
              <p className="text-sm text-muted-foreground truncate">{group.last_message}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{participantCount} {participantCount === 1 ? 'partecipante' : 'partecipanti'}</span>
              {group.last_message_at && (
                <>
                  <span>•</span>
                  <span>{formatTime(group.last_message_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <AuthGuard fallback={<Button variant="outline" size="sm" disabled>
            Accedi
          </Button>}>
          <div className="flex items-center gap-2">
            {(isHost || isParticipant) && (
              <Button 
                size="sm" 
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" 
                onClick={() => navigate(`/chat/group/${group.id}`)}
              >
                Entra
              </Button>
            )}
            
            {isHost ? (
                <GroupManagementModal
                  groupId={group.id}
                  groupTitle={group.title}
                  isHost={true}
                  groupCategory={group.category}
                >
                <Button variant="outline" size="sm" className="rounded-xl p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </GroupManagementModal>
            ) : isParticipant ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-xl" 
                onClick={() => onLeave?.(group.id)}
                disabled={isLeaving}
              >
                {isLeaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Esci"}
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="rounded-xl" 
                onClick={() => onJoin?.(group.id)}
                disabled={isJoining}
              >
                {isJoining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isJoining ? "Iscrivendo..." : "Iscriviti"}
              </Button>
            )}
          </div>
        </AuthGuard>
      </CardContent>
    </Card>;
};
export default function Gruppi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { groups, userGroups, isLoading, joinGroup, leaveGroup, loadPublicGroups, loadUserGroups } = useGroups();
  const { momentChats, isLoading: isMomentChatsLoading } = useMomentChats();
  const { conversations, isLoading: isConversationsLoading, loadConversations } = useChat();
  const { loadCityGroup, cityGroups } = useCityGroups();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem('gruppi-banner-dismissed') !== 'true';
  });
   const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());
   const [leavingGroups, setLeavingGroups] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('gruppi-banner-dismissed', 'true');
  };

  // FASE 2: Filter moment_chat groups from "I tuoi Gruppi" tab
  // Show only normal groups (not moment_chat) where user is participant or host
  const myNormalGroups = userGroups.filter(g => g.category !== 'moment_chat');
  
  // FASE 3: For Esplora tab - show only public groups where user is NOT a participant
  const exploreGroups = groups.filter(g => 
    g.is_public && 
    !userGroups.some(ug => ug.id === g.id) &&
    g.host_id !== user?.id
  );
  
  // FASE 5: Sort groups - unread first, then by last message time
  const sortedMyGroups = [...myNormalGroups].sort((a, b) => {
    // First priority: unread messages
    if (a.unread_count && !b.unread_count) return -1;
    if (!a.unread_count && b.unread_count) return 1;
    
    // Second priority: last message time
    if (a.last_message_at && b.last_message_at) {
      return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
    }
    
    // Fallback: creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  const filteredProvince = provincieItaliane.filter(provincia => 
    provincia.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load city groups participant counts
  useEffect(() => {
    filteredProvince.forEach(city => {
      loadCityGroup(city);
    });
  }, [filteredProvince.length]);
  
  const filteredMyGroups = sortedMyGroups.filter(gruppo => 
    gruppo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gruppo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gruppo.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredExploreGroups = exploreGroups.filter(gruppo => 
    gruppo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gruppo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gruppo.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    
    setJoiningGroups(prev => new Set(prev).add(groupId));
    
    try {
      const success = await joinGroup(groupId);
      if (success) {
        toast({
          title: "Iscrizione completata",
          description: "Ti sei iscritto al gruppo con successo!",
        });
      } else {
        toast({
          title: "Errore",
          description: "Non è stato possibile iscriverti al gruppo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'iscrizione.",
        variant: "destructive",
      });
    } finally {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    
    setLeavingGroups(prev => new Set(prev).add(groupId));
    
    try {
      const success = await leaveGroup(groupId);
      if (success) {
        toast({
          title: "Uscita completata", 
          description: "Hai lasciato il gruppo.",
        });
      } else {
        toast({
          title: "Errore",
          description: "Non è stato possibile lasciare il gruppo. Gli host non possono uscire dal proprio gruppo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore.",
        variant: "destructive",
      });
    } finally {
      setLeavingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };
  return <div className="min-h-screen bg-background">
      <Helmet>
        <title>Gruppi - LiveMoment</title>
        <meta name="description" content="Unisciti ai gruppi di LiveMoment per condividere momenti e esperienze con persone che condividono i tuoi interessi." />
        <link rel="canonical" href={`https://livemoment.app${location.pathname}`} />
      </Helmet>

      

      <div className="p-4">
        <Tabs defaultValue="gruppi" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="gruppi" className="text-xs">I Miei</TabsTrigger>
            <TabsTrigger value="esplora" className="text-xs">Esplora</TabsTrigger>
            <TabsTrigger value="citta" className="text-xs">Città</TabsTrigger>
            <TabsTrigger value="amici" className="text-xs">Amici</TabsTrigger>
            <TabsTrigger value="momenti" className="text-xs">Momenti</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-full" />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <TabsContent value="gruppi" className="space-y-4">
            {showBanner && <Card className="bg-muted/50 border-2 border-dashed border-primary/30 relative">
                <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0" onClick={dismissBanner}>
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
                  <Button className="rounded-xl" onClick={() => navigate('/crea/gruppo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea un Gruppo
                  </Button>
                </CardContent>
              </Card>}

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="mb-3">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredMyGroups.length > 0 ? (
              filteredMyGroups.map(gruppo => (
                <GroupCard 
                  key={gruppo.id} 
                  group={gruppo} 
                  type="user"
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                  isJoining={joiningGroups.has(gruppo.id)}
                  isLeaving={leavingGroups.has(gruppo.id)}
                  currentUserId={user?.id}
                />
              ))
            ) : (
              <>
                {/* CASO 1: Se c'è ricerca attiva e non trova nulla */}
                {searchQuery && filteredMyGroups.length === 0 ? (
                  <Card className="bg-muted/50">
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Nessun gruppo trovato</h3>
                      <p className="text-sm text-muted-foreground">
                        Non ci sono gruppi che corrispondono alla tua ricerca.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* CASO 2: Nessun gruppo disponibile - Mostra banner + pop-up regole */}
                    {sortedMyGroups.length === 0 && (
                      <>
                        {/* Banner "Crea il primo gruppo" */}
                        <Card className="bg-muted/50">
                          <CardContent className="p-6 text-center">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">Nessun gruppo trovato</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Non ci sono ancora gruppi disponibili.
                            </p>
                            <Button className="rounded-xl" onClick={() => navigate('/crea/gruppo')}>
                              <Plus className="mr-2 h-4 w-4" />
                              Crea il primo gruppo
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Pop-up con le regole dei gruppi */}
                        <GroupInfoModal 
                          trigger={
                            <Card className="mt-4 cursor-pointer hover:bg-muted/50 transition-colors border-2 border-primary/20">
                              <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Regole dei Gruppi</h4>
                                    <p className="text-xs text-muted-foreground">Scopri come funzionano</p>
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </CardContent>
                            </Card>
                          }
                        />
                      </>
                    )}

                    {/* CASO 3: Mostra sempre i gruppi dell'utente (se esistono) */}
                    {filteredMyGroups.map(gruppo => (
                      <GroupCard 
                        key={gruppo.id} 
                        group={gruppo} 
                        type="user"
                        onJoin={handleJoinGroup}
                        onLeave={handleLeaveGroup}
                        isJoining={joiningGroups.has(gruppo.id)}
                        isLeaving={leavingGroups.has(gruppo.id)}
                        currentUserId={user?.id}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="esplora" className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="mb-3">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredExploreGroups.length > 0 ? (
              filteredExploreGroups.map(gruppo => (
                <GroupCard 
                  key={gruppo.id} 
                  group={gruppo} 
                  type="user"
                  onJoin={handleJoinGroup}
                  isJoining={joiningGroups.has(gruppo.id)}
                  currentUserId={user?.id}
                />
              ))
            ) : (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nessun gruppo pubblico disponibile</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Non ci sono gruppi pubblici che corrispondono alla tua ricerca." : "Non ci sono ancora gruppi pubblici disponibili nella tua zona."}
                  </p>
                  <Button className="rounded-xl" onClick={() => navigate('/crea/gruppo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crea un gruppo pubblico
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="citta" className="space-y-4">
            {filteredProvince.slice(0, 10).map(provincia => <GroupCard key={provincia} group={provincia} type="city" cityGroupsMap={cityGroups} />)}
            {filteredProvince.length > 10 && <p className="text-center text-sm text-muted-foreground">
                Mostrando le prime 10 province. Usa la ricerca per trovarne altre.
              </p>}
          </TabsContent>

          <TabsContent value="amici" className="space-y-4">
            {isConversationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="mb-3">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Non hai ancora conversazioni con amici.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => navigate('/trova-amici')}>
                  Trova Amici
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <GroupCard 
                  key={conversation.id} 
                  group={{
                    id: conversation.id,
                    name: conversation.other_participant?.name || 'Utente',
                    avatar: conversation.other_participant?.avatar_url ? '👤' : '👤',
                    lastMessage: conversation.last_message?.content || 'Nessun messaggio',
                    time: conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '',
                    unread: conversation.unread_count || 0
                  }} 
                  type="friend" 
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="momenti" className="space-y-4">
            {isMomentChatsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="mb-3">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-12" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : momentChats.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Non hai momenti con chat attive.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => navigate('/crea/momento')}>
                  Crea Momento
                </Button>
              </div>
            ) : (
              momentChats.map((chat) => (
                <GroupCard key={chat.id} group={chat} type="moment" />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}