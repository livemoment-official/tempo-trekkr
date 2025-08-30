import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MomentComment {
  id: string;
  moment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    username: string;
    avatar_url: string;
  };
}

export function useMomentComments(momentId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all comments for a moment
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['moment-comments', momentId],
    queryFn: async (): Promise<MomentComment[]> => {
      // First get comments
      const { data: commentsData, error } = await supabase
        .from('moment_comments')
        .select('*')
        .eq('moment_id', momentId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (!commentsData || commentsData.length === 0) return [];
      
      // Get user profiles for each comment
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', userIds);
      
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return commentsData.map(comment => ({
        ...comment,
        user: profilesMap.get(comment.user_id) ? {
          name: profilesMap.get(comment.user_id)!.name,
          username: profilesMap.get(comment.user_id)!.username,
          avatar_url: profilesMap.get(comment.user_id)!.avatar_url
        } : undefined
      }));
    },
    enabled: !!momentId,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!content.trim()) throw new Error('Comment cannot be empty');

      const { error } = await supabase
        .from('moment_comments')
        .insert({
          moment_id: momentId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-comments', momentId] });
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato"
      });
    },
    onError: (error) => {
      console.error('Add comment error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile pubblicare il commento",
        variant: "destructive"
      });
    }
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      if (!content.trim()) throw new Error('Comment cannot be empty');

      const { error } = await supabase
        .from('moment_comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-comments', momentId] });
      toast({
        title: "Commento aggiornato",
        description: "Il tuo commento è stato modificato"
      });
    },
    onError: (error) => {
      console.error('Update comment error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile modificare il commento",
        variant: "destructive"
      });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('moment_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moment-comments', momentId] });
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato rimosso"
      });
    },
    onError: (error) => {
      console.error('Delete comment error:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile eliminare il commento",
        variant: "destructive"
      });
    }
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAdding: addCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
  };
}