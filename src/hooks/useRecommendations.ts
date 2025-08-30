import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Recommendation {
  id: string;
  name?: string;
  username?: string;
  title?: string;
  avatar_url?: string;
  recommendation_score: number;
  reason: string;
  type: 'friend' | 'moment';
}

export function useRecommendations(type: 'friends' | 'moments' = 'friends') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recommendations', type, user?.id],
    queryFn: async (): Promise<Recommendation[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { type }
      });

      if (error) throw error;

      return data.recommendations || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 15, // Refresh every 15 minutes
  });
}

export function useFriendRecommendations() {
  return useRecommendations('friends');
}

export function useMomentRecommendations() {
  return useRecommendations('moments');
}