import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UpdateContentData {
  title?: string;
  description?: string;
  tags?: string[];
  when_at?: string;
  place?: any;
  capacity?: number;
  max_participants?: number;
  age_range_min?: number;
  age_range_max?: number;
  photos?: string[];
  deleted_at?: string;
  host_id?: string;
}

// Hook for soft deleting content (moments, events, invites)
export function useDeleteContent(contentType: 'moments' | 'events' | 'invites') {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      console.log(`🗑️ [DELETE] Attempting to delete ${contentType} with ID:`, contentId);
      
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error(`🗑️ [DELETE] Authentication error:`, authError);
        throw new Error('Devi effettuare il login per eliminare il contenuto');
      }
      
      console.log(`🗑️ [DELETE] Authenticated user ID:`, user.id);
      console.log(`🗑️ [DELETE] Content type:`, contentType, 'Content ID:', contentId);
      
      // Soft delete: set deleted_at timestamp and ensure user owns the content
      // Use .select() to verify rows were actually updated
      // Pre-check ownership and existence to avoid false success and RLS return issues
      const { data: existing, error: checkError } = await supabase
        .from(contentType)
        .select('id')
        .eq('id', contentId)
        .eq('host_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

      if (checkError) {
        console.error('🗑️ [DELETE] Pre-check error:', checkError);
        throw new Error(checkError.message || 'Errore di verifica permessi');
      }
      if (!existing) {
        console.error('🗑️ [DELETE] Pre-check failed: not found or not owner', { contentType, contentId, userId: user.id });
        throw new Error('Contenuto non trovato o non hai i permessi per eliminarlo');
      }

      // Perform soft delete with minimal returning to avoid SELECT blocked by RLS after update
      const { error } = await supabase
        .from(contentType)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', contentId)
        .eq('host_id', user.id);

      if (error) {
        console.error('🗑️ [DELETE] Update error:', error);
        if (error.code === '42501') {
          throw new Error('Non hai i permessi per eliminare questo contenuto');
        }
        throw new Error(error.message || "Errore durante l'eliminazione");
      }

      console.log(`🗑️ [DELETE] Soft-deleted ${contentType} ${contentId} by ${user.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Archiviato con successo",
        description: "Il contenuto è stato archiviato e verrà eliminato definitivamente tra 30 giorni."
      });
      queryClient.invalidateQueries({ queryKey: [contentType] });
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      console.error(`Delete ${contentType} error:`, error);
      toast({
        title: "Errore",
        description: error.message || "Non è stato possibile eliminare il contenuto",
        variant: "destructive"
      });
    }
  });
}

// Hook for updating content (moments, events, invites)
export function useUpdateContent(contentType: 'moments' | 'events' | 'invites') {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContentData }) => {
      const { error } = await supabase
        .from(contentType)
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Aggiornato con successo",
        description: "Le modifiche sono state salvate."
      });
      queryClient.invalidateQueries({ queryKey: [contentType] });
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
    },
    onError: (error) => {
      console.error(`Update ${contentType} error:`, error);
      toast({
        title: "Errore",
        description: error.message || "Non è stato possibile salvare le modifiche",
        variant: "destructive"
      });
    }
  });
}