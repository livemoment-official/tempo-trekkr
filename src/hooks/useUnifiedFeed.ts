import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedGeolocation } from "./useUnifiedGeolocation";
import { getEventStatus, shouldDisplayEvent } from "@/utils/eventStatus";

export type UnifiedContentType = 'moment' | 'event';

export interface UnifiedFeedItem {
  id: string;
  contentType: UnifiedContentType;
  title: string;
  description?: string;
  when_at?: string;
  end_at?: string;
  place?: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  };
  host_id: string;
  host?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  participants?: string[];
  max_participants?: number;
  mood_tag?: string;
  tags?: string[];
  photos?: string[];
  is_public?: boolean;
  discovery_on?: boolean;
  age_range_min?: number;
  age_range_max?: number;
  registration_status: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  participant_count?: number;
  eventStatus?: string;
  ticketing?: any;
}

export interface UnifiedFeedFilters {
  query?: string;
  category?: string;
  subcategories?: string[];
  mood?: string;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  province?: string;
}

export function useUnifiedFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useUnifiedGeolocation();
  
  const [items, setItems] = useState<UnifiedFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<UnifiedFeedFilters>({});

  const ITEMS_PER_PAGE = 20;

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const loadFeed = useCallback(async (
    currentFilters: UnifiedFeedFilters = filters,
    resetPage = false
  ) => {
    setIsLoading(true);
    const currentPage = resetPage ? 0 : page;
    
    try {
      const now = new Date();
      const toleranceHours = 3;
      const tolerance = new Date(now.getTime() - toleranceHours * 60 * 60 * 1000);

      // Build base queries for moments and events
      let momentsQuery = supabase
        .from('moments')
        .select('*')
        .eq('is_public', true)
        .is('deleted_at', null)
        .not('when_at', 'is', null);

      let eventsQuery = supabase
        .from('events')
        .select('*')
        .eq('discovery_on', true)
        .is('deleted_at', null)
        .not('when_at', 'is', null);

      // Apply temporal filtering: only ongoing or future content
      const temporalFilter = `and(end_at.not.is.null,end_at.gte.${now.toISOString()}),` +
        `and(end_at.is.null,when_at.gte.${tolerance.toISOString()})`;
      
      momentsQuery = momentsQuery.or(temporalFilter);
      eventsQuery = eventsQuery.or(temporalFilter);

      // Apply common filters
      if (currentFilters.query) {
        const searchFilter = `title.ilike.%${currentFilters.query}%,description.ilike.%${currentFilters.query}%`;
        momentsQuery = momentsQuery.or(searchFilter);
        eventsQuery = eventsQuery.or(searchFilter);
      }

      if (currentFilters.mood) {
        momentsQuery = momentsQuery.eq('mood_tag', currentFilters.mood);
        eventsQuery = eventsQuery.eq('mood_tag', currentFilters.mood);
      }

      if (currentFilters.ageMin && currentFilters.ageMax) {
        momentsQuery = momentsQuery
          .gte('age_range_min', currentFilters.ageMin)
          .lte('age_range_max', currentFilters.ageMax);
        eventsQuery = eventsQuery
          .gte('age_range_min', currentFilters.ageMin)
          .lte('age_range_max', currentFilters.ageMax);
      }

      if (currentFilters.dateFrom) {
        momentsQuery = momentsQuery.gte('when_at', currentFilters.dateFrom.toISOString());
        eventsQuery = eventsQuery.gte('when_at', currentFilters.dateFrom.toISOString());
      }

      if (currentFilters.dateTo) {
        momentsQuery = momentsQuery.lte('when_at', currentFilters.dateTo.toISOString());
        eventsQuery = eventsQuery.lte('when_at', currentFilters.dateTo.toISOString());
      }

      if (currentFilters.tags && currentFilters.tags.length > 0) {
        momentsQuery = momentsQuery.overlaps('tags', currentFilters.tags);
        eventsQuery = eventsQuery.overlaps('tags', currentFilters.tags);
      }

      if (currentFilters.subcategories && currentFilters.subcategories.length > 0) {
        momentsQuery = momentsQuery.overlaps('tags', currentFilters.subcategories);
        eventsQuery = eventsQuery.overlaps('tags', currentFilters.subcategories);
      }

      if (currentFilters.province) {
        momentsQuery = momentsQuery.ilike('place->address', `%${currentFilters.province}%`);
        eventsQuery = eventsQuery.ilike('place->address', `%${currentFilters.province}%`);
      }

      // Execute both queries in parallel
      const [momentsResult, eventsResult] = await Promise.all([
        momentsQuery.order('created_at', { ascending: false }),
        eventsQuery.order('created_at', { ascending: false })
      ]);

      if (momentsResult.error) throw momentsResult.error;
      if (eventsResult.error) throw eventsResult.error;

      // Get host data for all items
      const allHostIds = [
        ...(momentsResult.data?.map(m => m.host_id) || []),
        ...(eventsResult.data?.map(e => e.host_id) || [])
      ].filter(Boolean);

      let hostData: any = {};
      if (allHostIds.length > 0) {
        const { data: hosts } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', allHostIds);
        
        if (hosts) {
          hostData = hosts.reduce((acc: any, host: any) => {
            acc[host.id] = host;
            return acc;
          }, {});
        }
      }

      // Process moments
      let processedMoments: UnifiedFeedItem[] = (momentsResult.data || []).map(moment => {
        const place = moment.place as any;
        let validPlace;
        
        if (place && typeof place === 'object') {
          const lat = place.lat ?? place.coordinates?.lat;
          const lng = place.lng ?? place.coordinates?.lng;
          
          if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
            validPlace = {
              lat: Number(lat),
              lng: Number(lng),
              name: place.name || '',
              address: place.address
            };
          }
        }

        const host = hostData[moment.host_id];
        const statusInfo = getEventStatus(moment.when_at, moment.end_at);

        return {
          id: moment.id,
          contentType: 'moment' as UnifiedContentType,
          title: moment.title,
          description: moment.description,
          when_at: moment.when_at,
          end_at: moment.end_at,
          place: validPlace,
          host_id: moment.host_id,
          host,
          participants: moment.participants || [],
          max_participants: moment.max_participants,
          mood_tag: moment.mood_tag,
          tags: moment.tags || [],
          photos: moment.photos || [],
          is_public: moment.is_public,
          age_range_min: moment.age_range_min,
          age_range_max: moment.age_range_max,
          registration_status: moment.registration_status || 'open',
          created_at: moment.created_at,
          updated_at: moment.updated_at,
          eventStatus: statusInfo?.status,
          participant_count: 0
        };
      });

      // Process events
      let processedEvents: UnifiedFeedItem[] = (eventsResult.data || []).map(event => {
        const place = event.place as any;
        let validPlace;
        
        if (place && typeof place === 'object') {
          const lat = place.lat ?? place.coordinates?.lat;
          const lng = place.lng ?? place.coordinates?.lng;
          
          if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
            validPlace = {
              lat: Number(lat),
              lng: Number(lng),
              name: place.name || '',
              address: place.address
            };
          }
        }

        const host = hostData[event.host_id];
        const statusInfo = getEventStatus(event.when_at, event.end_at);

        return {
          id: event.id,
          contentType: 'event' as UnifiedContentType,
          title: event.title,
          description: event.description,
          when_at: event.when_at,
          end_at: event.end_at,
          place: validPlace,
          host_id: event.host_id,
          host,
          max_participants: event.max_participants,
          mood_tag: event.mood_tag,
          tags: event.tags || [],
          photos: event.photos || [],
          discovery_on: event.discovery_on,
          age_range_min: event.age_range_min,
          age_range_max: event.age_range_max,
          registration_status: event.registration_status || 'open',
          created_at: event.created_at,
          updated_at: event.updated_at,
          eventStatus: statusInfo?.status,
          ticketing: event.ticketing,
          participant_count: 0
        };
      });

      // Combine all items
      let allItems = [...processedMoments, ...processedEvents];

      // Filter by temporal status
      allItems = allItems.filter(item => 
        shouldDisplayEvent(item.when_at, item.end_at)
      );

      // Add distance and filter by distance
      if (location && allItems.length > 0) {
        allItems = allItems.map(item => {
          if (item.place) {
            const distance = calculateDistance(
              location.lat,
              location.lng,
              item.place.lat,
              item.place.lng
            );
            return { ...item, distance_km: distance };
          }
          return item;
        });

        if (currentFilters.maxDistance) {
          allItems = allItems.filter(
            item => !item.distance_km || item.distance_km <= currentFilters.maxDistance!
          );
        }

        // Sort by distance and temporal status
        allItems.sort((a, b) => {
          // Priority 1: Distance
          if (a.distance_km !== undefined && b.distance_km !== undefined) {
            const distanceDiff = a.distance_km - b.distance_km;
            if (Math.abs(distanceDiff) > 0.5) return distanceDiff; // 500m threshold
          }

          // Priority 2: Temporal status (ongoing > soon > future)
          const statusPriority: Record<string, number> = {
            'live': 0,
            'starting_soon': 1,
            'upcoming': 2,
            'ended': 3
          };
          const aPriority = statusPriority[a.eventStatus || 'upcoming'] ?? 2;
          const bPriority = statusPriority[b.eventStatus || 'upcoming'] ?? 2;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }

          // Priority 3: Start time
          if (a.when_at && b.when_at) {
            return new Date(a.when_at).getTime() - new Date(b.when_at).getTime();
          }

          return 0;
        });
      }

      // Get participant counts
      const momentIds = allItems.filter(i => i.contentType === 'moment').map(i => i.id);
      const eventIds = allItems.filter(i => i.contentType === 'event').map(i => i.id);

      const [momentCounts, eventCounts] = await Promise.all([
        momentIds.length > 0 
          ? Promise.all(momentIds.map(async id => {
              const { count } = await supabase
                .from('moment_participants')
                .select('*', { count: 'exact', head: true })
                .eq('moment_id', id)
                .eq('status', 'confirmed');
              return { id, count: count || 0 };
            }))
          : [],
        eventIds.length > 0
          ? Promise.all(eventIds.map(async id => {
              const { count } = await supabase
                .from('event_participants')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', id)
                .eq('status', 'confirmed');
              return { id, count: count || 0 };
            }))
          : []
      ]);

      const countsMap = [...momentCounts, ...eventCounts].reduce((acc, { id, count }) => {
        acc[id] = count;
        return acc;
      }, {} as Record<string, number>);

      allItems = allItems.map(item => ({
        ...item,
        participant_count: countsMap[item.id] || 0
      }));

      // Apply pagination
      const start = currentPage * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginatedItems = allItems.slice(start, end);

      if (resetPage) {
        setItems(paginatedItems);
        setPage(1);
      } else {
        setItems(prev => [...prev, ...paginatedItems]);
        setPage(prev => prev + 1);
      }

      setHasMore(paginatedItems.length === ITEMS_PER_PAGE && allItems.length > end);
    } catch (error) {
      console.error('Error loading unified feed:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei contenuti",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, location, toast, calculateDistance]);

  const applyFilters = useCallback((newFilters: UnifiedFeedFilters) => {
    setFilters(newFilters);
    setPage(0);
    loadFeed(newFilters, true);
  }, [loadFeed]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadFeed(filters, false);
    }
  }, [isLoading, hasMore, loadFeed, filters]);

  const joinMoment = useCallback(async (momentId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per partecipare.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data: result, error } = await supabase.rpc('join_moment', {
        target_moment_id: momentId
      });

      if (error) throw error;

      if (result === 'joined') {
        setItems(prev => prev.map(item => 
          item.id === momentId && item.contentType === 'moment'
            ? { 
                ...item, 
                participants: [...(item.participants || []), user.id],
                participant_count: (item.participant_count || 0) + 1
              }
            : item
        ));
        
        toast({
          title: "Successo!",
          description: "Ti sei unito al momento con successo!",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error joining moment:', error);
      toast({
        title: "Errore",
        description: "Impossibile unirsi al momento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  const leaveMoment = useCallback(async (momentId: string) => {
    if (!user) return false;

    try {
      // Delete the participation record directly
      const { error } = await supabase
        .from('moment_participants')
        .delete()
        .eq('moment_id', momentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === momentId && item.contentType === 'moment'
          ? { 
              ...item, 
              participants: (item.participants || []).filter(id => id !== user.id),
              participant_count: Math.max(0, (item.participant_count || 0) - 1)
            }
          : item
      ));
      
      toast({
        title: "Successo",
        description: "Hai lasciato il momento",
      });
      return true;
    } catch (error) {
      console.error('Error leaving moment:', error);
      toast({
        title: "Errore",
        description: "Impossibile lasciare il momento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    items,
    isLoading,
    hasMore,
    filters,
    loadFeed,
    applyFilters,
    loadMore,
    joinMoment,
    leaveMoment
  };
}
