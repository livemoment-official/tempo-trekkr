import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

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
  const { data: reactions = [], isLoading, error: selectError } = useQuery({
    queryKey: ['moment-reactions', momentId],
    queryFn: async (): Promise<MomentReaction[]> => {
      const { data, error } = await supabase
        .from('moment_reactions')
        .select('id, moment_id, user_id, reaction_type, created_at')
        .eq('moment_id', momentId);
      
      if (error) {
        console.error('Error fetching reactions:', error);
        throw error;
      }
      return (data || []).map(reaction => ({
        ...reaction,
        reaction_type: reaction.reaction_type as ReactionType
      }));
    },
    enabled: !!momentId,
  });

  // Real-time subscription for reactions
  useEffect(() => {
    if (!momentId) return;

    const channel = supabase
      .channel(`moment-reactions:${momentId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'moment_reactions', 
          filter: `moment_id=eq.${momentId}` 
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['moment-reactions', momentId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [momentId, queryClient]);

  // Get user's reaction for this moment
  const userReaction = reactions.find(r => r.user_id === user?.id);

  // Get reaction counts
  const reactionCounts: ReactionCount[] = [
    'idea', 'star_eyes', 'yellow_heart'
  ].map(type => ({
    reaction_type: type as ReactionType,
    count: reactions.filter(r => r.reaction_type === type).length
  }));

  // Add reaction mutation with optimistic updates
  const addReactionMutation = useMutation({
    mutationFn: async (reactionType: ReactionType) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🎯 Attempting to add reaction:', {
        momentId,
        userId: user.id,
        reactionType
      });

      const { data, error } = await supabase
        .from('moment_reactions')
        .insert({
          moment_id: momentId,
          user_id: user.id,
          reaction_type: reactionType
        })
        .select();

      if (error) {
        console.error('❌ Database error adding reaction:', error);
        throw error;
      }

      console.log('✅ Reaction added successfully:', data);
      return data;
    },
    onMutate: async (reactionType: ReactionType) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['moment-reactions', momentId] });

      // Snapshot previous value
      const previousReactions = queryClient.getQueryData<MomentReaction[]>(['moment-reactions', momentId]);

      // Optimistically update
      if (user?.id) {
        const newReaction: MomentReaction = {
          id: `temp-${Date.now()}`,
          moment_id: momentId,
          user_id: user.id,
          reaction_type: reactionType,
          created_at: new Date().toISOString()
        };

        queryClient.setQueryData<MomentReaction[]>(['moment-reactions', momentId], (old = []) => {
          const filtered = old.filter(r => r.user_id !== user.id);
          return [...filtered, newReaction];
        });
      }

      return { previousReactions };
    },
    onError: (error, reactionType, context) => {
      // Rollback on error
      if (context?.previousReactions) {
        queryClient.setQueryData(['moment-reactions', momentId], context.previousReactions);
      }
      
      console.error('❌ Add reaction error:', {
        error,
        momentId,
        userId: user?.id,
        reactionType,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: error
      });
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Non è stato possibile aggiungere la reazione";
      
      toast({
        title: "Errore reazione",
        description: errorMessage,
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-reactions', momentId] });
    }
  });

  // Remove reaction mutation with optimistic updates
  const removeReactionMutation = useMutation({
    mutationFn: async (reactionId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('moment_reactions')
        .delete()
        .eq('id', reactionId);

      if (error) throw error;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['moment-reactions', momentId] });

      // Snapshot previous value
      const previousReactions = queryClient.getQueryData<MomentReaction[]>(['moment-reactions', momentId]);

      // Optimistically update
      if (user?.id) {
        queryClient.setQueryData<MomentReaction[]>(['moment-reactions', momentId], (old = []) => 
          old.filter(r => r.user_id !== user.id)
        );
      }

      return { previousReactions };
    },
    onError: (error, reactionId, context) => {
      // Rollback on error
      if (context?.previousReactions) {
        queryClient.setQueryData(['moment-reactions', momentId], context.previousReactions);
      }
      
      console.error('Remove reaction error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Non è stato possibile rimuovere la reazione",
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-reactions', momentId] });
    }
  });

  // Toggle reaction
  const toggleReaction = (reactionType: ReactionType) => {
    if (!user?.id) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per reagire",
        variant: "destructive"
      });
      return;
    }
    
    if (userReaction) {
      if (userReaction.reaction_type === reactionType) {
        // Remove current reaction
        removeReactionMutation.mutate(userReaction.id);
      } else {
        // Replace reaction: remove current, then add new
        removeReactionMutation.mutate(userReaction.id, {
          onSuccess: () => {
            addReactionMutation.mutate(reactionType);
          }
        });
      }
    } else {
      // Add new reaction
      addReactionMutation.mutate(reactionType);
    }
  };

  return {
    reactions,
    reactionCounts,
    userReaction,
    isLoading,
    hasError: !!selectError,
    toggleReaction,
    isToggling: addReactionMutation.isPending || removeReactionMutation.isPending,
  };
}