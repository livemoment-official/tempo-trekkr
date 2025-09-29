import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface EventInvitation {
  id: string;
  event_id: string;
  status: 'invited' | 'accepted' | 'rejected';
  invited_at: string;
  responded_at?: string;
  invitation_message?: string;
  response_message?: string;
  events: {
    id: string;
    title: string;
    description?: string;
    when_at?: string;
    place?: any;
    host_id: string;
    photos?: string[];
  };
}

export function useEventInvitations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch invitations for current user (both artist and venue)
  const { data: invitations = [], isLoading, error } = useQuery({
    queryKey: ['event-invitations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Check if user has artist profile
      const { data: artistProfile } = await supabase
        .from('artists')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Check if user has venue profile  
      const { data: venueProfile } = await supabase
        .from('venues')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const invitations: EventInvitation[] = [];

      // Fetch artist invitations
      if (artistProfile) {
        const { data: artistInvitations, error: artistError } = await supabase
          .from('event_artists')
          .select(`
            id,
            event_id,
            status,
            invited_at,
            responded_at,
            invitation_message,
            response_message,
            events (
              id,
              title,
              description,
              when_at,
              place,
              host_id,
              photos
            )
          `)
          .eq('artist_id', artistProfile.id)
          .order('invited_at', { ascending: false });

        if (artistError) throw artistError;
        invitations.push(...(artistInvitations || []).map(inv => ({
          ...inv,
          status: inv.status as 'invited' | 'accepted' | 'rejected'
        })));
      }

      // Fetch venue invitations
      if (venueProfile) {
        const { data: venueInvitations, error: venueError } = await supabase
          .from('event_venues')
          .select(`
            id,
            event_id,
            status,
            contacted_at,
            responded_at,
            contact_message,
            response_message,
            events (
              id,
              title,
              description,
              when_at,
              place,
              host_id,
              photos
            )
          `)
          .eq('venue_id', venueProfile.id)
          .order('contacted_at', { ascending: false });

        if (venueError) throw venueError;
        invitations.push(...(venueInvitations || []).map(inv => ({
          ...inv,
          invited_at: inv.contacted_at,
          invitation_message: inv.contact_message,
          status: inv.status as 'invited' | 'accepted' | 'rejected'
        })));
      }

      return invitations;
    },
    enabled: !!user,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('event-invitations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_artists',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['event-invitations', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_venues',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['event-invitations', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Mutation to update invitation status
  const updateInvitationMutation = useMutation({
    mutationFn: async ({
      invitationId,
      status,
      responseMessage,
      isArtist
    }: {
      invitationId: string;
      status: 'accepted' | 'rejected';
      responseMessage?: string;
      isArtist: boolean;
    }) => {
      const tableName = isArtist ? 'event_artists' : 'event_venues';
      
      const { error } = await supabase
        .from(tableName)
        .update({
          status,
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-invitations', user?.id] });
      
      toast({
        title: "Risposta inviata",
        description: `Hai ${variables.status === 'accepted' ? 'accettato' : 'rifiutato'} l'invito.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la risposta. Riprova.",
        variant: "destructive",
      });
      console.error('Error updating invitation:', error);
    },
  });

  return {
    invitations,
    isLoading,
    error,
    updateInvitation: updateInvitationMutation.mutate,
    isUpdating: updateInvitationMutation.isPending,
  };
}