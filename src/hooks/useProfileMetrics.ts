import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileMetrics {
  friendsCount: number;
  eventsCount: number;
  peopleMet: number;
  loading: boolean;
}

export function useProfileMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ProfileMetrics>({
    friendsCount: 0,
    eventsCount: 0,
    peopleMet: 0,
    loading: true
  });

  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      setMetrics(prev => ({ ...prev, loading: true }));

      // Get profile for friends count
      const { data: profile } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('id', user.id)
        .single();

      const friendsCount = (profile?.followers_count || 0) + (profile?.following_count || 0);

      // Get events created by user
      const { data: createdMoments } = await supabase
        .from('moments')
        .select('id')
        .eq('host_id', user.id);

      const { data: createdEvents } = await supabase
        .from('events')
        .select('id')
        .eq('host_id', user.id);

      // Get events user participated in
      const { data: participatedMoments } = await supabase
        .from('moment_participants')
        .select('moment_id')
        .eq('user_id', user.id);

      const { data: participatedEvents } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id);

      const eventsCount = (createdMoments?.length || 0) + 
                         (createdEvents?.length || 0) + 
                         (participatedMoments?.length || 0) + 
                         (participatedEvents?.length || 0);

      // Calculate people met (participants from events user participated in)
      let peopleMet = 0;

      if (participatedMoments && participatedMoments.length > 0) {
        const momentIds = participatedMoments.map(p => p.moment_id);
        const { data: momentParticipants } = await supabase
          .from('moment_participants')
          .select('user_id')
          .in('moment_id', momentIds)
          .neq('user_id', user.id);
        
        const uniqueMomentUsers = new Set(momentParticipants?.map(p => p.user_id) || []);
        peopleMet += uniqueMomentUsers.size;
      }

      if (participatedEvents && participatedEvents.length > 0) {
        const eventIds = participatedEvents.map(p => p.event_id);
        const { data: eventParticipants } = await supabase
          .from('event_participants')
          .select('user_id')
          .in('event_id', eventIds)
          .neq('user_id', user.id);
        
        const uniqueEventUsers = new Set(eventParticipants?.map(p => p.user_id) || []);
        peopleMet += uniqueEventUsers.size;
      }

      // Also count participants from events user created
      if (createdMoments && createdMoments.length > 0) {
        const createdMomentIds = createdMoments.map(m => m.id);
        const { data: hostedMomentParticipants } = await supabase
          .from('moment_participants')
          .select('user_id')
          .in('moment_id', createdMomentIds)
          .neq('user_id', user.id);
        
        const uniqueHostedMomentUsers = new Set(hostedMomentParticipants?.map(p => p.user_id) || []);
        peopleMet += uniqueHostedMomentUsers.size;
      }

      if (createdEvents && createdEvents.length > 0) {
        const createdEventIds = createdEvents.map(e => e.id);
        const { data: hostedEventParticipants } = await supabase
          .from('event_participants')
          .select('user_id')
          .in('event_id', createdEventIds)
          .neq('user_id', user.id);
        
        const uniqueHostedEventUsers = new Set(hostedEventParticipants?.map(p => p.user_id) || []);
        peopleMet += uniqueHostedEventUsers.size;
      }

      setMetrics({
        friendsCount,
        eventsCount,
        peopleMet,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching profile metrics:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
    }
  };

  return { metrics, refetch: fetchMetrics };
}