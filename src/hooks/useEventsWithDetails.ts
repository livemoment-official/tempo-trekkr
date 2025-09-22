import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventsWithDetails() {
  return useQuery({
    queryKey: ['events-with-details'],
    queryFn: async () => {
      // Fetch events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('discovery_on', true)
        .order('when_at', { ascending: true });

      if (eventsError) throw eventsError;

      // For each event, fetch its artists and venues
      const eventsWithDetails = await Promise.all(
        events.map(async (event) => {
          const [artistsResult, venuesResult] = await Promise.all([
            supabase
              .from('event_artists')
              .select(`
                artists (
                  name,
                  stage_name,
                  avatar_url,
                  artist_type
                )
              `)
              .eq('event_id', event.id),
            
            supabase
              .from('event_venues')
              .select(`
                venues (
                  name,
                  venue_type
                )
              `)
              .eq('event_id', event.id)
          ]);

          return {
            ...event,
            artists: artistsResult.data || [],
            venues: venuesResult.data || []
          };
        })
      );

      return eventsWithDetails;
    },
  });
}