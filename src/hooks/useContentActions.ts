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
}

// Hook for soft deleting content (moments, events, invites)
export function useDeleteContent(contentType: 'moments' | 'events' | 'invites') {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      // Soft delete: set deleted_at timestamp instead of hard delete
      const { error } = await supabase
        .from(contentType)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', contentId);

      if (error) throw error;
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
        description: "Non è stato possibile eliminare il contenuto",
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
        description: "Non è stato possibile salvare le modifiche",
        variant: "destructive"
      });
    }
  });
}