import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useRealTimePresence } from './useRealTimePresence';

export type AvailabilityStatus = 'offline' | 'online' | 'available';

interface Availability {
  id: string;
  is_on: boolean;
  shareable: boolean;
  start_at?: string;
  end_at?: string;
}

export function useAvailabilityStatus() {
  const { user } = useAuth();
  const { isOnline } = useRealTimePresence();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [status, setStatus] = useState<AvailabilityStatus>('offline');

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const checkExpiredAvailability = async () => {
    if (!availability || !availability.end_at) return;

    const now = new Date();
    const endTime = new Date(availability.end_at);
    
    if (now > endTime && availability.is_on) {
      // Auto-expire availability
      try {
        await supabase
          .from('availability')
          .update({ 
            is_on: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', availability.id);
        
        setAvailability({ ...availability, is_on: false });
      } catch (error) {
        console.error('Error auto-expiring availability:', error);
      }
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  useEffect(() => {
    // Check for expired availability every minute
    const interval = setInterval(checkExpiredAvailability, 60000);
    return () => clearInterval(interval);
  }, [availability]);

  useEffect(() => {
    // Simplified status determination
    if (!isOnline) {
      setStatus('offline');
    } else if (availability?.is_on && availability?.shareable) {
      // Check if availability is not expired
      if (availability.end_at) {
        const now = new Date();
        const endTime = new Date(availability.end_at);
        if (now <= endTime) {
          setStatus('available');
        } else {
          setStatus('online');
        }
      } else {
        setStatus('available');
      }
    } else {
      setStatus('online');
    }
  }, [isOnline, availability]);

  return {
    status,
    availability,
    isOnline,
    fetchAvailability
  };
}