import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MomentDetail {
  id: string;
  title: string;
  description: string;
  photos: string[];
  when_at: string;
  end_at?: string;
  place: {
    name: string;
    coordinates?: { lat: number; lng: number };
  } | null;
  host_id: string;
  host: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    age?: number;
    verified?: boolean;
  } | null;
  participants: string[];
  max_participants?: number;
  capacity?: number;
  mood_tag?: string;
  tags: string[];
  is_public: boolean;
  age_range_min?: number;
  age_range_max?: number;
  ticketing?: any;
  payment_required?: boolean;
  price_cents?: number;
  currency?: string;
  livemoment_fee_percentage?: number;
  organizer_fee_percentage?: number;
  created_at: string;
  updated_at: string;
  participant_count: number;
  can_edit: boolean;
}

export function useMomentDetail(momentId: string) {
  const [moment, setMoment] = useState<MomentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMoment = async () => {
    if (!momentId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch moment data
      const { data: momentData, error: momentError } = await supabase
        .from('moments')
        .select('*')
        .eq('id', momentId)
        .single();

      if (momentError) {
        if (momentError.code === 'PGRST116') {
          setError('Momento non trovato');
          return;
        }
        throw momentError;
      }

      // Fetch host profile
      const { data: hostProfile, error: hostError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, bio')
        .eq('id', momentData.host_id)
        .single();

      if (hostError) {
        console.warn('Could not fetch host profile:', hostError);
      }

      // Get participant count from relational table
      const { count: participantCount } = await supabase
        .from('moment_participants')
        .select('*', { count: 'exact', head: true })
        .eq('moment_id', momentId)
        .eq('status', 'confirmed');

      // Get current user to check edit permissions
      const { data: { user } } = await supabase.auth.getUser();
      const canEdit = user?.id === momentData.host_id;

      // Transform data to match interface
      const transformedMoment: MomentDetail = {
        id: momentData.id,
        title: momentData.title,
        description: momentData.description || '',
        photos: momentData.photos || [],
        when_at: momentData.when_at,
        end_at: momentData.end_at,
        place: momentData.place as any,
        host_id: momentData.host_id,
        host: hostProfile ? {
          id: hostProfile.id,
          name: hostProfile.name || 'Utente',
          avatar_url: hostProfile.avatar_url,
          bio: hostProfile.bio,
          verified: true // TODO: implement verification system
        } : null,
        participants: momentData.participants || [],
        max_participants: momentData.max_participants,
        capacity: momentData.capacity,
        mood_tag: momentData.mood_tag,
        tags: momentData.tags || [],
        is_public: momentData.is_public,
        age_range_min: momentData.age_range_min,
        age_range_max: momentData.age_range_max,
        ticketing: momentData.ticketing,
        payment_required: momentData.payment_required,
        price_cents: momentData.price_cents,
        currency: momentData.currency,
        livemoment_fee_percentage: momentData.livemoment_fee_percentage,
        organizer_fee_percentage: momentData.organizer_fee_percentage,
        created_at: momentData.created_at,
        updated_at: momentData.updated_at,
        participant_count: participantCount || 0,
        can_edit: canEdit
      };

      setMoment(transformedMoment);
    } catch (err) {
      console.error('Error fetching moment:', err);
      setError('Errore nel caricamento del momento');
      toast({
        title: "Errore",
        description: "Errore nel caricamento del momento",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoment();
  }, [momentId]);

  const refreshMoment = () => {
    fetchMoment();
  };

  return {
    moment,
    isLoading,
    error,
    refreshMoment
  };
}