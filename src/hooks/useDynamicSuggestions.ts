import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDynamicSuggestions() {
  // Fetch live data for suggestions
  const { data: availableUsers } = useQuery({
    queryKey: ['available-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('available_now')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: eventsCount } = useQuery({
    queryKey: ['events-today-count'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('discovery_on', true)
        .gte('when_at', `${today}T00:00:00`)
        .lt('when_at', `${today}T23:59:59`);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const { data: artistsCount } = useQuery({
    queryKey: ['artists-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('artists')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    availableUsers: availableUsers || 0,
    eventsCount: eventsCount || 0,
    artistsCount: artistsCount || 0,
  };
}