import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedGeolocation } from "./useUnifiedGeolocation";
import { getEventStatus, shouldDisplayEvent } from "@/utils/eventStatus";

export interface Event {
  id: string;
  title: string;
  description?: string;
  when_at?: string;
  end_at?: string;
  place?: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  host_id: string;
  host?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  max_participants?: number;
  capacity?: number;
  mood_tag?: string;
  tags?: string[];
  photos?: string[];
  discovery_on: boolean;
  age_range_min?: number;
  age_range_max?: number;
  registration_status: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  participant_count?: number;
  ticketing?: any;
  eventStatus?: string;
}

export function useEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useUnifiedGeolocation();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load events with basic filters
  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from('events')
        .select(`*`)
        .eq('discovery_on', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      // Show events that haven't ended yet
      // Filter based on end_at if available
      const now = new Date().toISOString();
      query = query.or(`when_at.is.null,end_at.is.null,end_at.gte.${now}`);

      const { data, error } = await query;

      if (error) throw error;

      // Get host data for all events
      const hostIds = data?.map(e => e.host_id).filter(Boolean) || [];
      let hostData: any = {};
      
      if (hostIds.length > 0) {
        const { data: hosts } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', hostIds);
        
        if (hosts) {
          hostData = hosts.reduce((acc: any, host: any) => {
            acc[host.id] = host;
            return acc;
          }, {});
        }
      }

      let processedEvents = (data || []).map(event => {
        // Handle both coordinate formats for place
        const place = event.place as any;
        let validPlace;
        
        if (place && typeof place === 'object') {
          const lat = place.lat || place.coordinates?.lat;
          const lng = place.lng || place.coordinates?.lng;
          
          if (lat && lng) {
            validPlace = {
              lat: Number(lat),
              lng: Number(lng),
              name: place.name || '',
              address: place.address,
              coordinates: place.coordinates || { lat: Number(lat), lng: Number(lng) }
            };
          }
        }

        const host = hostData[event.host_id] || undefined;

        // Calculate event status
        const statusInfo = getEventStatus(event.when_at, event.end_at);

        return {
          ...event,
          place: validPlace,
          host: host,
          eventStatus: statusInfo?.status
        };
      }) as unknown as Event[];

      // Filter out completely ended events
      processedEvents = processedEvents.filter(event => 
        shouldDisplayEvent(event.when_at, event.end_at)
      );

      // Add distance calculation if user location is available
      if (location && processedEvents.length > 0) {
        processedEvents = processedEvents.map(event => {
          if (event.place && typeof event.place === 'object') {
            const place = event.place as any;
            const lat = place.lat || place.coordinates?.lat;
            const lng = place.lng || place.coordinates?.lng;
            
            if (lat && lng) {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                lat,
                lng
              );
              return { ...event, distance_km: distance };
            }
          }
          return event;
        });

        // Sort by distance
        processedEvents.sort((a, b) => {
          if (a.distance_km && b.distance_km) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
      }

      // Get participant count from event_participants
      processedEvents = await Promise.all(processedEvents.map(async event => {
        const { count } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'confirmed');
        
        return {
          ...event,
          participant_count: count || 0
        };
      }));

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento degli eventi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [location, toast]);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    loadEvents
  };
}