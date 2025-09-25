import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, MapPin, Loader2 } from "lucide-react";
import { MomentFilters } from "@/components/moments/MomentFilters";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentsMap } from "@/components/moments/MomentsMap";

import { useMoments } from "@/hooks/useMoments";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSnapScroll } from "@/hooks/useSnapScroll";

export default function MomentiEventi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/";
  const [view, setView] = useState<'list' | 'map'>('list');
  const isMobile = useIsMobile();
  
  // Use real moments data
  const {
    moments,
    isLoading: momentsLoading,
    hasMore,
    filters,
    loadMoments,
    applyFilters,
    loadMore,
    joinMoment,
    leaveMoment
  } = useMoments();

  // Use events data
  const {
    events,
    isLoading: eventsLoading
  } = useEvents();

  // Combine moments and events with unified format
  const allItems = [
    ...moments.map(moment => ({
      ...moment,
      type: 'moment' as const,
      organizer: moment.organizer || (moment.host ? 
        { 
          name: moment.host.name || 'Utente', 
          avatar: moment.host.avatar_url 
        } : 
        { name: 'Utente', avatar: null }
      ),
      time: moment.when_at ? new Date(moment.when_at).toLocaleString('it-IT') : 'Ora da definire',
      location: moment.place?.name || 'Luogo da definire',
      category: moment.tags?.[0] || 'generale'
    })),
    ...events.map(event => ({
      ...event,
      type: 'event' as const,
      participants: [] as string[], // Events use separate table
      is_public: event.discovery_on,
      image: event.photos?.[0],
      category: 'evento',
      organizer: event.host ? {
        name: event.host.name,
        avatar: event.host.avatar_url
      } : { name: 'Organizzatore', avatar: null },
      time: event.when_at ? new Date(event.when_at).toLocaleString('it-IT') : 'Data da definire',
      location: event.place?.name || 'Luogo da definire'
    }))
  ];

  const isLoading = momentsLoading || eventsLoading;

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore
  });

  // Mobile snap scroll
  const { containerRef, scrollToIndex, currentIndex } = useSnapScroll({
    enabled: isMobile && view === 'list',
    onSnapChange: (index) => {
      console.log('Snapped to card:', index);
    }
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

      
      
      <div className="space-y-4">
        <MomentFilters
          onFiltersChange={handleFilterChange}
          currentFilters={filters}
          view={view}
          onViewChange={setView}
        />
      </div>

      {/* Content */}
      {view === 'list' ? (
        <div 
          ref={containerRef}
          className={isMobile 
            ? "overflow-y-auto snap-y snap-mandatory h-screen -mx-4 -mt-4" 
            : "space-y-6"
          }
          style={isMobile ? { 
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch'
          } : undefined}
        >
          <div className={isMobile 
            ? "flex flex-col" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          }>
            {allItems.map((item, index) => {
              const isEvent = item.type === 'event';
              
              return (
                <div key={`${item.type}-${item.id}-${index}`} className={isMobile ? "snap-start" : ""}>
                  {/* Event/Moment Badge */}
                  <div className="relative">
                    {isEvent && (
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 z-20 bg-brand text-white"
                      >
                        Evento
                      </Badge>
                    )}
                    <MomentCard
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      image={item.image || item.photos?.[0]}
                      category={item.category}
                      time={item.time}
                      location={item.location}
                      organizer={item.organizer}
                      participants={item.participant_count || item.participants?.length || 0}
                      maxParticipants={item.max_participants}
                      mood={item.mood_tag}
                      distance={item.distance_km}
                      isOwner={item.host_id === user?.id}
                      hostId={item.host_id}
                      onJoin={isEvent ? undefined : () => joinMoment(item.id)}
                      onLeave={isEvent ? undefined : () => leaveMoment(item.id)}
                      tags={item.tags}
                      reactions={{ hearts: 0, likes: 0, stars: 0, fire: 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Caricamento {momentsLoading && eventsLoading ? 'momenti ed eventi' : momentsLoading ? 'momenti' : 'eventi'}...
              </span>
            </div>
          )}
          
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          
          {/* No more data message */}
          {!hasMore && allItems.length > 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Non ci sono altri contenuti da caricare
            </div>
          )}
          
          {/* Empty state */}
          {allItems.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2">Nessun contenuto trovato</h3>
              <p className="text-muted-foreground mb-4">
                Prova a cambiare i filtri o crea il tuo primo momento!
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/crea/momento')}>
                  Crea momento
                </Button>
                <Button variant="outline" onClick={() => navigate('/crea/evento')}>
                  Crea evento
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Render unified moments and events for map */}
          <MomentsMap moments={allItems} onMomentClick={(id) => navigate(`/moment/${id}`)} />
        </div>
      )}
    </div>
  );
}