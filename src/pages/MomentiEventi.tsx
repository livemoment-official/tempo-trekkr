import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { List, MapPin, Loader2 } from "lucide-react";
import { MomentFilters } from "@/components/moments/MomentFilters";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentsMap } from "@/components/moments/MomentsMap";
import { LocationPermissionCard } from "@/components/location/LocationPermissionCard";
import { useMoments } from "@/hooks/useMoments";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function MomentiEventi() {
  const location = useLocation();
  const navigate = useNavigate();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/";
  const [view, setView] = useState<'list' | 'map'>('list');
  
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
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore
  });

  // Load initial data
  useEffect(() => {
    loadMoments({}, true);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    applyFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Momenti & Eventi</title>
        <meta name="description" content="Esplora Momenti ed Eventi in lista o su mappa. Filtra per categoria, età, posizione e mood." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <LocationPermissionCard />
      
      <MomentFilters
        onFiltersChange={handleFilterChange}
        currentFilters={filters}
      />

      {/* View Toggle */}
      <div className="flex items-center gap-2 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={view === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('list')}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          Lista
        </Button>
        <Button
          variant={view === 'map' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('map')}
          className="gap-2"
        >
          <MapPin className="h-4 w-4" />
          Mappa
        </Button>
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moments.map(moment => (
              <MomentCard 
                key={moment.id} 
                id={moment.id}
                image={moment.photos?.[0] || ""}
                title={moment.title}
                description={moment.description || ""}
                category={moment.mood_tag || "generale"}
                time={moment.when_at ? new Date(moment.when_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ""}
                location={moment.place?.name || ""}
                organizer={{ 
                  name: moment.host?.name || "Organizzatore",
                  avatar: moment.host?.avatar_url || ""
                }}
                participants={moment.participant_count || 0}
                maxParticipants={moment.max_participants || 0}
                distance={moment.distance_km}
                onJoin={() => joinMoment(moment.id)}
                onLeave={() => leaveMoment(moment.id)}
                tags={moment.tags || []}
                reactions={{ hearts: 0, likes: 0, stars: 0, fire: 0 }}
              />
            ))}
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Caricamento momenti...</span>
            </div>
          )}
          
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          
          {/* No more data message */}
          {!hasMore && moments.length > 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Non ci sono altri momenti da caricare
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && moments.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">Nessun momento trovato</h3>
              <p className="text-muted-foreground mb-4">
                Prova a cambiare i filtri o crea il tuo primo momento!
              </p>
              <Button onClick={() => navigate('/crea/momento')}>
                Crea momento
              </Button>
            </div>
          )}
        </div>
      ) : (
        <MomentsMap 
          moments={moments}
          onMomentClick={(momentId) => navigate(`/moment/${momentId}`)}
        />
      )}
    </div>
  );
}