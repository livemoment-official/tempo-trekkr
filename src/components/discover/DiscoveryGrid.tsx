import React from 'react';
import { Users, Calendar, MapPin, Music, Star, Clock, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useArtists } from '@/hooks/useArtists';
import { useVenues } from '@/hooks/useVenues';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { EnhancedImage } from '@/components/ui/enhanced-image';

export function DiscoveryGrid() {
  const navigate = useNavigate();
  // Fetch all data
  const { data: availableUsers } = useQuery({
    queryKey: ['available-users-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_now')
        .select('*')
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: events } = useQuery({
    queryKey: ['discovery-events-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, place, when_at, tags, photos')
        .eq('discovery_on', true)
        .order('when_at', { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: moments } = useQuery({
    queryKey: ['discovery-moments-grid'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moments')
        .select('id, title, when_at, tags, photos')
        .eq('is_public', true)
        .order('when_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch real artists
  const { data: artists } = useArtists();
  
  // Fetch real venues  
  const { data: venues } = useVenues();

  // Mix all content types
  const allContent = [
    ...(availableUsers?.map(user => ({ type: 'person', data: user })) || []),
    ...(events?.map(event => ({ type: 'event', data: event })) || []),
    ...(moments?.map(moment => ({ type: 'moment', data: moment })) || []),
    ...(artists?.slice(0, 8).map(artist => ({ type: 'artist', data: artist })) || []),
    ...(venues?.slice(0, 8).map(venue => ({ type: 'venue', data: venue })) || [])
  ].sort(() => Math.random() - 0.5); // Shuffle content

  const getCardContent = (item: any) => {
    const { type, data } = item;

    switch (type) {
      case 'person':
        return (
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none bg-transparent" onClick={() => navigate(`/user/${data.user_id}`)}>
            <CardContent className="p-0 relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <Avatar className="w-full h-full rounded-lg">
                <AvatarImage 
                  src={data.avatar_url || '/livemoment-mascot.png'} 
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="w-full h-full rounded-lg bg-primary/10">
                  <Users className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <Badge variant="secondary" className="mb-1 bg-background/90 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Persona
                </Badge>
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{data.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{data.job_title}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'event':
        return (
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none bg-transparent" onClick={() => navigate(`/event/${data.id}`)}>
            <CardContent className="p-0 relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center overflow-hidden">
                {data.photos && data.photos.length > 0 ? (
                  <EnhancedImage 
                    src={data.photos[0]} 
                    alt={data.title} 
                    className="w-full h-full object-cover rounded-lg"
                    fallbackSrc=""
                    showSkeleton={false}
                  />
                ) : (
                  <Calendar className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <Badge variant="secondary" className="mb-1 bg-background/90 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  Evento
                </Badge>
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{data.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(data.when_at).toLocaleDateString('it-IT')}
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'moment':
        return (
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none bg-transparent" onClick={() => navigate(`/moment/${data.id}`)}>
            <CardContent className="p-0 relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/20 rounded-lg flex items-center justify-center overflow-hidden">
                {data.photos && data.photos.length > 0 ? (
                  <EnhancedImage 
                    src={data.photos[0]} 
                    alt={data.title} 
                    className="w-full h-full object-cover rounded-lg"
                    fallbackSrc=""
                    showSkeleton={false}
                  />
                ) : (
                  <MapPin className="w-12 h-12 text-primary" />
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <Badge variant="secondary" className="mb-1 bg-background/90 text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Momento
                </Badge>
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{data.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Heart className="w-3 h-3 mr-1" />
                  Moment
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'artist':
        return (
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none bg-transparent" onClick={() => navigate(`/artist/${data.id}`)}>
            <CardContent className="p-0 relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
               <Avatar className="w-full h-full rounded-lg">
                 <AvatarImage 
                   src={data.avatar_url || '/livemoment-mascot.png'} 
                   className="object-cover w-full h-full"
                 />
                 <AvatarFallback className="w-full h-full rounded-lg bg-primary/10">
                   <Music className="w-8 h-8 text-primary" />
                 </AvatarFallback>
               </Avatar>
               <div className="absolute bottom-2 left-2 right-2 z-20">
                 <Badge variant="secondary" className="mb-1 bg-background/90 text-xs">
                   <Music className="w-3 h-3 mr-1" />
                   Artista
                 </Badge>
                 <h3 className="font-semibold text-sm text-foreground line-clamp-1">{data.name}</h3>
                 <div className="flex items-center text-xs text-muted-foreground">
                   <Star className="w-3 h-3 mr-1" />
                   {data.genres?.join(', ') || 'Artista'}
                 </div>
               </div>
            </CardContent>
          </Card>
        );

      case 'venue':
        return (
          <Card className="group cursor-pointer overflow-hidden border-0 shadow-none bg-transparent" onClick={() => navigate(`/location/${data.id}`)}>
            <CardContent className="p-0 relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
              <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center overflow-hidden">
                {data.venue_photos && data.venue_photos.length > 0 ? (
                  <EnhancedImage 
                    src={data.venue_photos[0]} 
                    alt={data.name} 
                    className="w-full h-full object-cover rounded-lg"
                    fallbackSrc=""
                    showSkeleton={false}
                  />
                ) : (
                  <MapPin className="w-12 h-12 text-accent" />
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2 z-20">
                <Badge variant="secondary" className="mb-1 bg-background/90 text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location
                </Badge>
                <h3 className="font-semibold text-sm text-foreground line-clamp-1">{data.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  {data.venue_type || 'Venue'}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allContent.map((item, index) => (
          <div key={`${item.type}-${index}`} className="animate-fade-in">
            {getCardContent(item)}
          </div>
        ))}
      </div>
    </div>
  );
}