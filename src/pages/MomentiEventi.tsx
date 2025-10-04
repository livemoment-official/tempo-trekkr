import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { MomentFilters } from "@/components/moments/MomentFilters";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentsMap } from "@/components/moments/MomentsMap";

import { useUnifiedFeed } from "@/hooks/useUnifiedFeed";
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
  
  // Auto-hide filters on scroll
  const [showFilters, setShowFilters] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Load initial data
  useEffect(() => {
    loadFeed({}, true);
  }, []);

  // Auto-hide filters on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold
        setShowFilters(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setShowFilters(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle filter changes
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

  return (
    <div className="space-y-4">
      <Helmet>
        <title>LiveMoment · Momenti & Eventi</title>
        <meta name="description" content="Esplora Momenti ed Eventi in lista o su mappa. Filtra per categoria, età, posizione e mood." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      {/* Filters with auto-hide */}
      <div 
        className={`sticky top-16 z-30 bg-background/95 backdrop-blur-sm transition-transform duration-300 -mx-5 px-5 md:-mx-8 md:px-8 ${
          showFilters ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
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