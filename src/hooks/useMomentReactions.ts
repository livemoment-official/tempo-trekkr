import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ReactionType = 'idea' | 'star_eyes' | 'yellow_heart';

interface MomentReaction {
  id: string;
  moment_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

interface ReactionCount {
  reaction_type: ReactionType;
  count: number;
}

export function useMomentReactions(momentId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all reactions for a moment
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['moment-reactions', momentId],
    queryFn: async (): Promise<MomentReaction[]> => {
      const { data, error } = await supabase
        .from('moment_reactions')
        .select('*')
        .eq('moment_id', momentId);
      
      if (error) throw error;
      return (data || []).map(reaction => ({
        ...reaction,
        reaction_type: reaction.reaction_type as ReactionType
      }));
    },
    enabled: !!momentId,
  });

  // Get user's reaction for this moment
  const userReaction = reactions.find(r => r.user_id === user?.id);

  // Get reaction counts
  const reactionCounts: ReactionCount[] = [
    'idea', 'star_eyes', 'yellow_heart'
  ].map(type => ({
    reaction_type: type as ReactionType,
    count: reactions.filter(r => r.reaction_type === type).length
  }));

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('moment_reactions')
        .insert({
          moment_id: momentId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-reactions', momentId] });
      toast({
        title: "Reazione aggiunta",
        description: "La tua reazione è stata aggiunta al momento"
      });
    },
    onError: (error) => {
      console.error('Add reaction error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiungere la reazione",
        variant: "destructive"
      });
    }
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !userReaction) throw new Error('No reaction to remove');

      const { error } = await supabase
        .from('moment_reactions')
        .delete()
        .eq('id', userReaction.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-reactions', momentId] });
      toast({
        title: "Reazione rimossa",
        description: "La tua reazione è stata rimossa"
      });
    },
    onError: (error) => {
      console.error('Remove reaction error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile rimuovere la reazione",
        variant: "destructive"
      });
    }
  });

  // Toggle reaction
  const toggleReaction = (reactionType: ReactionType) => {
    if (userReaction) {
      if (userReaction.reaction_type === reactionType) {
        removeReactionMutation.mutate();
      } else {
        // Remove old reaction and add new one
        removeReactionMutation.mutate();
        setTimeout(() => addReactionMutation.mutate(reactionType), 100);
      }
    } else {
      addReactionMutation.mutate(reactionType);
    }
  };

  return {
    reactions,
    reactionCounts,
    userReaction,
    isLoading,
    toggleReaction,
    isToggling: addReactionMutation.isPending || removeReactionMutation.isPending,
  };
}