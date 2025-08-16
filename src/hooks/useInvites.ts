import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Invite {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  participants: string[];
  when_at?: string;
  place?: any; // Using any for now since it's Json type from Supabase
  status: 'pending' | 'accepted' | 'rejected' | 'postponed';
  invite_count: number;
  can_be_public: boolean;
  response_message?: string;
  location_radius?: number;
  created_at: string;
  updated_at: string;
}

export function useMyInvites() {
  return useQuery({
    queryKey: ['my-invites'],
    queryFn: async (): Promise<{ received: Invite[]; sent: Invite[] }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Inviti ricevuti (dove sono nei participants)
      const { data: received, error: receivedError } = await supabase
        .from('invites')
        .select('*')
        .contains('participants', [user.id])
        .neq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (receivedError) throw receivedError;

      // Inviti inviati (dove sono l'host)
      const { data: sent, error: sentError } = await supabase
        .from('invites')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (sentError) throw sentError;

      return {
        received: (received || []) as Invite[],
        sent: (sent || []) as Invite[]
      };
    },
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inviteData: {
      title: string;
      description?: string;
      participants: string[];
      when_at?: Date;
      place?: {
        name: string;
        coordinates?: [number, number];
      };
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('invites')
        .insert({
          title: inviteData.title,
          description: inviteData.description,
          host_id: user.id,
          participants: inviteData.participants,
          when_at: inviteData.when_at?.toISOString(),
          place: inviteData.place,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      toast({
        title: "Invito inviato!",
        description: "Il tuo invito è stato inviato con successo.",
      });
    },
    onError: (error) => {
      console.error('Error creating invite:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile inviare l'invito.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateInviteStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      inviteId,
      status,
      responseMessage
    }: {
      inviteId: string;
      status: 'accepted' | 'rejected' | 'postponed';
      responseMessage?: string;
    }) => {
      const { data, error } = await supabase
        .from('invites')
        .update({
          status,
          response_message: responseMessage
        })
        .eq('id', inviteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      
      const statusText = {
        accepted: 'accettato',
        rejected: 'rifiutato',
        postponed: 'rimandato'
      }[variables.status];

      toast({
        title: "Invito aggiornato",
        description: `Hai ${statusText} l'invito.`,
      });
    },
    onError: (error) => {
      console.error('Error updating invite:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile aggiornare l'invito.",
        variant: "destructive",
      });
    },
  });
}

export function useTransformToMoment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      // Prima ottieni l'invito
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('*')
        .eq('id', inviteId)
        .single();

      if (inviteError) throw inviteError;

      // Crea un momento pubblico basato sull'invito
      const { data: moment, error: momentError } = await supabase
        .from('moments')
        .insert({
          title: invite.title,
          description: invite.description,
          host_id: invite.host_id,
          participants: invite.participants,
          when_at: invite.when_at,
          place: invite.place,
          is_public: true
        })
        .select()
        .single();

      if (momentError) throw momentError;

      // Aggiorna l'invito per indicare che è diventato pubblico
      const { error: updateError } = await supabase
        .from('invites')
        .update({ can_be_public: true })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      return moment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invites'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      
      toast({
        title: "Momento creato!",
        description: "L'invito è stato trasformato in un momento pubblico.",
      });
    },
    onError: (error) => {
      console.error('Error transforming invite:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile creare il momento.",
        variant: "destructive",
      });
    },
  });
}