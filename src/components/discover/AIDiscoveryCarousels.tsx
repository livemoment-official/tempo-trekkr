import React from 'react';
import { Users, Calendar, MapPin, Music, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AICarousel, CarouselItem } from './AICarousel';
import { AIRecommendationCard } from './AIRecommendationCard';
import { UserDiscoveryCard } from '../profile/UserDiscoveryCard';

export function AIDiscoveryCarousels() {
  // Fetch available users
  const { data: availableUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['available-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_now')
        .select('*')
        .limit(12);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch events
  const { data: events, isLoading: loadingEvents } = useQuery({
    queryKey: ['discovery-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, place, when_at, tags')
        .eq('discovery_on', true)
        .order('when_at', { ascending: true })
        .limit(12);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch moments for location inspiration
  const { data: moments, isLoading: loadingMoments } = useQuery({
    queryKey: ['discovery-moments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moments')
        .select('id, title, when_at, tags')
        .eq('is_public', true)
        .order('when_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data || [];
    }
  });

  // Mock artists data (you can replace with real data)
  const mockArtists = [
    { id: 1, name: 'Marco Rossi', genre: 'Jazz', location: 'Milano', rating: 4.8, image: null },
    { id: 2, name: 'Luna Sound', genre: 'Electronic', location: 'Roma', rating: 4.6, image: null },
    { id: 3, name: 'Vintage Vibes', genre: 'Indie Rock', location: 'Torino', rating: 4.7, image: null },
    { id: 4, name: 'Soul Sisters', genre: 'R&B', location: 'Napoli', rating: 4.9, image: null },
    { id: 5, name: 'Urban Beats', genre: 'Hip Hop', location: 'Bologna', rating: 4.5, image: null },
    { id: 6, name: 'Acoustic Dreams', genre: 'Folk', location: 'Firenze', rating: 4.8, image: null },
  ];

  const handlePersonAction = (userId: string) => {
    console.log('Inviting user:', userId);
    // Implement invite logic
  };

  const handleEventAction = (eventId: string) => {
    console.log('Joining event:', eventId);
    // Implement join event logic
  };

  const handleLocationAction = (momentId: string) => {
    console.log('Exploring location:', momentId);
    // Implement location exploration logic
  };

  const handleArtistAction = (artistId: number) => {
    console.log('Contacting artist:', artistId);
    // Implement artist contact logic
  };

  return (
    <div className="space-y-12 py-8">
      {/* People Carousel */}
      <AICarousel
        title="Persone che dovresti conoscere"
        icon={<Users className="h-5 w-5 text-primary" />}
        loading={loadingUsers}
        itemCount={6}
      >
        {availableUsers?.map((user) => (
          <CarouselItem key={user.user_id} className="basis-auto">
            <AIRecommendationCard
              type="person"
              title={user.name}
              subtitle={user.job_title}
              description={`${user.mood} • Disponibile ora`}
              tags={user.interests}
              actionLabel="Invita"
              onAction={() => handlePersonAction(user.user_id)}
              aiReason="Condividete interessi simili e siete entrambi disponibili ora nella stessa zona"
              image={user.avatar_url}
            />
          </CarouselItem>
        ))}
      </AICarousel>

      {/* Events Carousel */}
      <AICarousel
        title="Eventi e Live consigliati per te"
        icon={<Calendar className="h-5 w-5 text-primary" />}
        loading={loadingEvents}
        itemCount={6}
      >
        {events?.map((event) => (
          <CarouselItem key={event.id} className="basis-auto">
            <AIRecommendationCard
              type="event"
              title={event.title}
              subtitle={typeof event.place === 'string' ? event.place : (event.place as any)?.name || 'Location TBD'}
              tags={event.tags || []}
              actionLabel="Partecipa"
              onAction={() => handleEventAction(event.id)}
              aiReason="Basato sui tuoi gusti musicali e la vicinanza alla tua zona"
              date={new Date(event.when_at).toLocaleDateString('it-IT')}
              rating={4.5}
            />
          </CarouselItem>
        ))}
      </AICarousel>

      {/* Locations Carousel */}
      <AICarousel
        title="Location da esplorare"
        icon={<MapPin className="h-5 w-5 text-primary" />}
        loading={loadingMoments}
        itemCount={6}
      >
        {moments?.map((moment) => (
          <CarouselItem key={moment.id} className="basis-auto">
            <AIRecommendationCard
              type="location"
              title={moment.title}
              subtitle="Location speciale"
              tags={moment.tags || []}
              actionLabel="Esplora"
              onAction={() => handleLocationAction(moment.id)}
              aiReason="Altri utenti con i tuoi interessi hanno adorato questo posto"
              location="Zona interessante"
              rating={4.3}
            />
          </CarouselItem>
        ))}
      </AICarousel>

      {/* Artists Carousel */}
      <AICarousel
        title="Artisti nella tua zona"
        icon={<Music className="h-5 w-5 text-primary" />}
        loading={false}
        itemCount={6}
      >
        {mockArtists.map((artist) => (
          <CarouselItem key={artist.id} className="basis-auto">
            <AIRecommendationCard
              type="artist"
              title={artist.name}
              subtitle={artist.genre}
              description="Disponibile per collaborazioni ed eventi"
              actionLabel="Contatta"
              onAction={() => handleArtistAction(artist.id)}
              aiReason="Il suo stile musicale si allinea perfettamente con i tuoi gusti"
              location={artist.location}
              rating={artist.rating}
              image={artist.image}
            />
          </CarouselItem>
        ))}
      </AICarousel>
    </div>
  );
}
