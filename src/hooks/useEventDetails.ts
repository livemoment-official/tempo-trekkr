import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['event-details', eventId],
    queryFn: async () => {
      // Fetch event with related artists and venues
      const [eventResult, artistsResult, venuesResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single(),
        
        supabase
          .from('event_artists')
          .select(`
            *,
            artists (*)
          `)
          .eq('event_id', eventId),
          
        supabase
          .from('event_venues')
          .select(`
            *,
            venues (*)
          `)
          .eq('event_id', eventId)
      ]);

      if (eventResult.error) throw eventResult.error;

      return {
        event: eventResult.data,
        artists: artistsResult.data || [],
        venues: venuesResult.data || []
      };
    },
    enabled: !!eventId,
  });
}