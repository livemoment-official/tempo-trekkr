import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ViewToggle } from "@/components/moments/ViewToggle";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentsMap } from "@/components/moments/MomentsMap";

import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useFilters } from "@/contexts/FiltersContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSnapScroll } from "@/hooks/useSnapScroll";

export default function MomentiEventi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canonical = typeof window !== "undefined" ? window.location.origin + location.pathname : "/";
  const { view, setView, filters: globalFilters } = useFilters();
  const isMobile = useIsMobile();

  // Use unified feed (moments + events)
  const {
    items,
    isLoading,
    hasMore,
    filters,
    loadFeed,
    applyFilters,
    loadMore,
    joinMoment,
    leaveMoment
  } = useUnifiedFeed();

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

  // Auto-hide toggle on scroll
  const [showToggle, setShowToggle] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data with global filters
  useEffect(() => {
    const filters = {
      category: globalFilters.category,
      subcategories: globalFilters.subcategories,
      mood: globalFilters.mood,
      ageMin: globalFilters.ageRange?.[0],
      ageMax: globalFilters.ageRange?.[1],
      maxDistance: globalFilters.maxDistance,
      tags: globalFilters.subcategories
    };
    loadFeed(filters, true);
  }, [globalFilters]);

  // Scroll listener for auto-hide toggle
  useEffect(() => {
    const container = containerRef.current;
    if (!container || view !== 'list') {
      setShowToggle(true);
      return;
    }

    const handleScroll = () => {
      // Hide toggle when scrolling
      setShowToggle(false);
      
      // Clear previous timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Show toggle after 3 seconds of inactivity
      scrollTimeoutRef.current = setTimeout(() => {
        setShowToggle(true);
      }, 3000);
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [view]);

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Momenti & Eventi</title>
        <meta name="description" content="Esplora Momenti ed Eventi in lista o su mappa. Filtra per categoria, età, posizione e mood." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* View Toggle - Floating with auto-hide */}
      <ViewToggle view={view} onViewChange={setView} isVisible={showToggle} />

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
            {items.map((item, index) => {
              const isEvent = item.contentType === 'event';
              
              return (
                <div key={`${item.contentType}-${item.id}-${index}`} className={isMobile ? "snap-start" : ""}>
                  {/* Event Badge */}
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
                      description={item.description || ""}
                      image={item.photos?.[0] || ""}
                      category={item.mood_tag || "generale"}
                      time={item.when_at ? new Date(item.when_at).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ""}
                      place={item.place}
                      participantIds={item.participants || []}
                      organizer={{
                        name: item.host?.name || "Organizzatore",
                        avatar: item.host?.avatar_url || ""
                      }}
                      participants={item.participant_count || 0}
                      maxParticipants={item.max_participants || 0}
                      mood={item.mood_tag}
                      distance={item.distance_km}
                      isOwner={item.host_id === user?.id}
                      hostId={item.host_id}
                      when_at={item.when_at}
                      end_at={item.end_at}
                      onJoin={item.contentType === 'moment' ? () => joinMoment(item.id) : undefined}
                      onLeave={item.contentType === 'moment' ? () => leaveMoment(item.id) : undefined}
                      tags={item.tags || []}
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
                Caricamento contenuti...
              </span>
            </div>
          )}
          
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />
          
          {/* No more data message */}
          {!hasMore && items.length > 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Non ci sono altri contenuti da caricare
            </div>
          )}
          
          {/* Empty state */}
          {items.length === 0 && !isLoading && (
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
          <MomentsMap moments={items.filter(i => i.contentType === 'moment')} onMomentClick={(id) => navigate(`/moment/${id}`)} />
        </div>
      )}
    </div>
  );
}