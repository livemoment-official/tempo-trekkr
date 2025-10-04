import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, MapPin, Loader2 } from "lucide-react";
import { useUnifiedGeolocation } from "@/hooks/useUnifiedGeolocation";
import { MomentFilters } from "@/components/moments/MomentFilters";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentsMap } from "@/components/moments/MomentsMap";
import { LocationPermissionCard } from "@/components/location/LocationPermissionCard";
import { useMoments } from "@/hooks/useMoments";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/";
  const [view, setView] = useState<'list' | 'map'>('list');
  const {
    location: userLocation
  } = useUnifiedGeolocation();

  // Use real moments data
  const {
    moments,
    isLoading,
    hasMore,
    filters,
    loadMoments,
    applyFilters,
    loadMore,
    joinMoment,
    leaveMoment
  } = useMoments();

  // Infinite scroll
  const {
    sentinelRef
  } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore
  });

  // Load initial data
  useEffect(() => {
    loadMoments({}, true);
  }, []);

  // Handle filter changes with proper state
  const [filterState, setFilterState] = useState({
    category: null,
    subcategories: [],
    mood: null,
    ageRange: [18, 65] as [number, number],
    maxDistance: 50
  });
  const handleFilterChange = (newFilters: any) => {
    const filters = {
      category: newFilters.category,
      subcategories: newFilters.subcategories,
      mood: newFilters.mood,
      ageMin: newFilters.ageRange?.[0],
      ageMax: newFilters.ageRange?.[1],
      maxDistance: newFilters.maxDistance,
      tags: newFilters.subcategories
    };
    applyFilters(filters);
  };
  return <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Home</title>
        <meta name="description" content="Scopri i momenti più vicini a te. Filtra per categoria, età, posizione e mood per trovare l'esperienza perfetta." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <LocationPermissionCard />
      
      <MomentFilters onFiltersChange={handleFilterChange} currentFilters={filterState} view={view} onViewChange={setView} />

      {/* Content */}
      {view === 'list' ? <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map(moment => <MomentCard key={moment.id} id={moment.id} image={moment.photos?.[0] || ""} title={moment.title} description={moment.description || ""} category={moment.mood_tag || "generale"} time={moment.when_at ? new Date(moment.when_at).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit'
        }) : ""} location={moment.place?.name || ""} organizer={{
          name: moment.host?.name || "Organizzatore",
          avatar: moment.host?.avatar_url || ""
        }} participants={moment.participant_count || 0} maxParticipants={moment.max_participants || 0} distance={moment.distance_km} onJoin={() => joinMoment(moment.id)} onLeave={() => leaveMoment(moment.id)} tags={moment.tags || []} hostId={moment.host_id} when_at={moment.when_at} end_at={moment.end_at} reactions={{
          hearts: 0,
          likes: 0,
          stars: 0,
          fire: 0
        }} />)}
          </div>
          
          {/* Loading indicator */}
          {isLoading && <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Caricamento momenti...</span>
            </div>}
          
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          
          {/* No more data message */}
          {!hasMore && moments.length > 0 && <div className="text-center py-8 text-sm text-muted-foreground">
              Non ci sono altri momenti da caricare
            </div>}
          
          {/* Empty state */}
          {!isLoading && moments.length === 0 && <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">Nessun momento trovato</h3>
              <p className="text-muted-foreground mb-4">
                Prova a cambiare i filtri o crea il tuo primo momento!
              </p>
              <Button onClick={() => navigate('/crea/momento')}>
                Crea momento
              </Button>
            </div>}
        </div> : <MomentsMap moments={moments} onMomentClick={momentId => navigate(`/moment/${momentId}`)} />}
    </div>;
};
export default Index;