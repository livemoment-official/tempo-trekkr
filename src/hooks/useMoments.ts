import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedGeolocation } from "./useUnifiedGeolocation";
import { getEventStatus, shouldDisplayEvent } from "@/utils/eventStatus";

export interface Moment {
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
  organizer?: {
    name: string;
    avatar?: string;
  };
  participants: string[];
  max_participants?: number;
  capacity?: number;
  mood_tag?: string;
  tags?: string[];
  photos?: string[];
  image?: string;
  is_public: boolean;
  age_range_min?: number;
  age_range_max?: number;
  registration_status: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  participant_count?: number;
  eventStatus?: string;
}

export interface MomentsFilters {
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
  isPaid?: boolean | null;
  priceMin?: number;
  priceMax?: number;
  showOnlyJoined?: boolean;
}

export function useMoments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useUnifiedGeolocation();
  
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<MomentsFilters>({});

  const ITEMS_PER_PAGE = 12;
  const MAX_ITEMS = 100; // Limit to prevent memory issues

  // Calculate distance between two points - memoized with useCallback
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Convert mock data to Moment interface
  const convertMockToMoment = (mockMoment: any, userLat?: number, userLng?: number): Moment => {
    // Generate coordinates around user location if available, otherwise Milan
    const baseLat = userLat || 45.4642;
    const baseLng = userLng || 9.1900;
    const mockLat = baseLat + (Math.random() - 0.5) * 0.1;
    const mockLng = baseLng + (Math.random() - 0.5) * 0.1;
    
    return {
      id: mockMoment.id,
      title: mockMoment.title,
      description: mockMoment.description,
      when_at: mockMoment.date,
      place: {
        lat: mockLat,
        lng: mockLng,
        name: mockMoment.location,
        address: mockMoment.location
      },
      host_id: mockMoment.organizer.user_id,
      host: {
        id: mockMoment.organizer.user_id,
        name: mockMoment.organizer.name,
        avatar_url: mockMoment.organizer.avatar_url
      },
      participants: Array.from({ length: mockMoment.participant_count }, (_, i) => `mock_user_${i + 1}`),
      max_participants: mockMoment.max_participants,
      capacity: mockMoment.max_participants,
      mood_tag: mockMoment.mood,
      tags: mockMoment.tags,
      photos: [mockMoment.image_url, ...(mockMoment.photos || [])],
      image: mockMoment.image_url,
      is_public: true,
      age_range_min: 18,
      age_range_max: 65,
      registration_status: 'open',
      created_at: mockMoment.created_at,
      updated_at: mockMoment.created_at,
      participant_count: mockMoment.participant_count
    };
  };

  // Load moments with filters and pagination
  const loadMoments = useCallback(async (
    currentFilters: MomentsFilters = filters,
    resetPage = false
  ) => {
    setIsLoading(true);
    const currentPage = resetPage ? 0 : page;
    const pageSize = 20;
    
    try {
      let query = supabase
        .from('moments')
        .select(`*`)
        .eq('is_public', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

      // CRITICAL: Moments MUST have when_at to appear in feed
      query = query.not('when_at', 'is', null);

      // Filter based on temporal status:
      // - If moment has end_at: show only if end_at >= now (not yet ended)
      // - If moment has NO end_at: show only if when_at >= now - 24h (24h tolerance after start)
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      query = query.or(
        `and(end_at.not.is.null,end_at.gte.${now.toISOString()}),` +
        `and(end_at.is.null,when_at.gte.${yesterday.toISOString()})`
      );

      // Apply filters
      if (currentFilters.query) {
        query = query.or(`title.ilike.%${currentFilters.query}%,description.ilike.%${currentFilters.query}%`);
      }

      if (currentFilters.mood) {
        query = query.eq('mood_tag', currentFilters.mood);
      }

      if (currentFilters.ageMin && currentFilters.ageMax) {
        query = query
          .gte('age_range_min', currentFilters.ageMin)
          .lte('age_range_max', currentFilters.ageMax);
      }

      if (currentFilters.dateFrom) {
        query = query.gte('when_at', currentFilters.dateFrom.toISOString());
      }

      if (currentFilters.dateTo) {
        query = query.lte('when_at', currentFilters.dateTo.toISOString());
      }

      if (currentFilters.tags && currentFilters.tags.length > 0) {
        query = query.overlaps('tags', currentFilters.tags);
      }

      if (currentFilters.subcategories && currentFilters.subcategories.length > 0) {
        query = query.overlaps('tags', currentFilters.subcategories);
      }

      if (currentFilters.province) {
        query = query.ilike('place->address', `%${currentFilters.province}%`);
      }

      if (currentFilters.isPaid !== null && currentFilters.isPaid !== undefined) {
        if (currentFilters.isPaid === false) {
          query = query.or('payment_required.is.false,price_cents.is.null,price_cents.eq.0');
        } else {
          query = query.eq('payment_required', true).gt('price_cents', 0);
          if (currentFilters.priceMin) {
            query = query.gte('price_cents', currentFilters.priceMin * 100);
          }
          if (currentFilters.priceMax) {
            query = query.lte('price_cents', currentFilters.priceMax * 100);
          }
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get host data for all moments
      const momentIds = data?.map(m => m.host_id).filter(Boolean) || [];
      let hostData: any = {};
      
      if (momentIds.length > 0) {
        const { data: hosts } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', momentIds);
        
        if (hosts) {
          hostData = hosts.reduce((acc: any, host: any) => {
            acc[host.id] = host;
            return acc;
          }, {});
        }
      }

      let processedMoments = (data || []).map(moment => {
        // Cast place to proper type and handle both coordinate formats
        const place = moment.place as any;
        let validPlace;
        
        if (place && typeof place === 'object') {
          // Safe access to lat/lng using optional chaining and nullish coalescing
          const lat = place.lat ?? place.coordinates?.lat;
          const lng = place.lng ?? place.coordinates?.lng;
          
          // Only create validPlace if we have both coordinates
          if (lat !== undefined && lat !== null && lng !== undefined && lng !== null) {
            validPlace = {
              lat: Number(lat),
              lng: Number(lng),
              name: place.name || '',
              address: place.address
            };
          }
        }

        // Get host data from separate query
        const host = hostData[moment.host_id] || undefined;

        // Calculate event status
        const statusInfo = getEventStatus(moment.when_at, moment.end_at);

        return {
          ...moment,
          place: validPlace,
          host: host,
          eventStatus: statusInfo?.status
        };
      }) as unknown as Moment[];

      // Filter out completely ended events
      processedMoments = processedMoments.filter(moment => 
        shouldDisplayEvent(moment.when_at, moment.end_at)
      );

      // Only show real moments from database - no mock data

      // Add distance calculation if user location is available
      if (location && processedMoments.length > 0) {
        processedMoments = processedMoments.map(moment => {
          if (moment.place && typeof moment.place === 'object') {
            const place = moment.place as any;
            if (place.lat && place.lng) {
              const distance = calculateDistance(
                location.lat,
                location.lng,
                place.lat,
                place.lng
              );
              return { ...moment, distance_km: distance };
            }
          }
          return moment;
        });

        // Apply distance filter
        if (currentFilters.maxDistance) {
          processedMoments = processedMoments.filter(
            moment => !moment.distance_km || moment.distance_km <= currentFilters.maxDistance!
          );
        }

        // Sort by distance if no other sorting
        processedMoments.sort((a, b) => {
          if (a.distance_km && b.distance_km) {
            return a.distance_km - b.distance_km;
          }
          return 0;
        });
      }

      // Calculate participant count from relational table data
      processedMoments = await Promise.all(processedMoments.map(async moment => {
        const { count } = await supabase
          .from('moment_participants')
          .select('*', { count: 'exact', head: true })
          .eq('moment_id', moment.id)
          .eq('status', 'confirmed');
        
        return {
          ...moment,
          participant_count: count || 0
        };
      }));

      if (resetPage) {
        setMoments(processedMoments);
        setPage(1);
      } else {
        setMoments(prev => [...prev, ...processedMoments]);
        setPage(prev => prev + 1);
      }

      setHasMore(processedMoments.length === pageSize);
    } catch (error) {
      console.error('Error loading moments:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei momenti",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, location, toast]);

  // Helper function to get moment IDs for a user
  const getUserMomentIds = async (userId: string): Promise<string[]> => {
    const { data } = await supabase
      .from('moment_participants')
      .select('moment_id')
      .eq('user_id', userId)
      .eq('status', 'confirmed');
    
    return data?.map(p => p.moment_id) || [];
  };

  // Load user's joined moments
  const loadUserMoments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get moment IDs where user participates
      const participantMomentIds = await getUserMomentIds(user.id);
      
      let query = supabase
        .from('moments')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter for moments where user is host OR participant
      if (participantMomentIds.length > 0) {
        query = query.or(`host_id.eq.${user.id},id.in.(${participantMomentIds.join(',')})`);
      } else {
        query = query.eq('host_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedMoments = await Promise.all((data || []).map(async moment => {
        // Cast place to proper type
        const place = moment.place as any;
        const validPlace = place && typeof place === 'object' && place.lat && place.lng 
          ? {
              lat: Number(place.lat),
              lng: Number(place.lng),
              name: place.name || '',
              address: place.address
            }
          : undefined;

        // Get participant count from relational table
        const { count } = await supabase
          .from('moment_participants')
          .select('*', { count: 'exact', head: true })
          .eq('moment_id', moment.id)
          .eq('status', 'confirmed');

        return {
          ...moment,
          place: validPlace,
          host: undefined, // Will be populated separately if needed
          participant_count: count || 0
        };
      })) as unknown as Moment[];

      setMoments(processedMoments);
    } catch (error) {
      console.error('Error loading user moments:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei tuoi momenti",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Apply filters and reload
  const applyFilters = useCallback((newFilters: MomentsFilters) => {
    setFilters(newFilters);
    setPage(0);
    loadMoments(newFilters, true);
  }, [loadMoments]);

  // Load more moments (infinite scroll)
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadMoments(filters, false);
    }
  }, [isLoading, hasMore, loadMoments, filters]);

  // Join moment
  const joinMoment = useCallback(async (momentId: string) => {
    try {
      if (!user) {
        toast({
          title: "Accesso richiesto",
          description: "Devi effettuare l'accesso per partecipare.",
          variant: "destructive",
        });
        return false;
      }

      // Use the secure RPC function to join the moment
      const { data: result, error } = await supabase.rpc('join_moment', {
        target_moment_id: momentId
      });

      if (error) throw error;

      switch (result) {
        case 'joined':
          // Update local state - the trigger will sync the participants array
          setMoments(prev => prev.map(m => 
            m.id === momentId 
              ? { 
                  ...m, 
                  participants: [...(m.participants || []), user.id],
                  participant_count: (m.participant_count || 0) + 1
                }
              : m
          ));
          
          toast({
            title: "Successo!",
            description: "Ti sei unito al momento con successo!",
          });
          return true;
        case 'already_joined':
          toast({
            title: "Già partecipante",
            description: "Stai già partecipando a questo momento.",
          });
          return false;
        case 'full':
          toast({
            title: "Momento completo",
            description: "Questo momento ha raggiunto il numero massimo di partecipanti.",
            variant: "destructive",
          });
          return false;
        case 'not_found':
          toast({
            title: "Errore",
            description: "Momento non trovato.",
            variant: "destructive",
          });
          return false;
        default:
          toast({
            title: "Errore",
            description: "Risposta inaspettata dal server.",
            variant: "destructive",
          });
          return false;
      }
    } catch (error) {
      console.error('Error joining moment:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile partecipare al momento. Riprova più tardi.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, toast]);

  // Leave moment
  const leaveMoment = useCallback(async (momentId: string) => {
    if (!user) return false;

    try {
      // Remove user from moment_participants
      const { error } = await supabase
        .from('moment_participants')
        .delete()
        .eq('moment_id', momentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state - the trigger will sync the participants array
      setMoments(prev => prev.map(m => 
        m.id === momentId 
          ? { 
              ...m, 
              participants: m.participants.filter(id => id !== user.id),
              participant_count: Math.max(0, m.participant_count - 1)
            }
          : m
      ));

      toast({
        title: "Partecipazione rimossa",
        description: "Non partecipi più a questo momento"
      });

      return true;
    } catch (error) {
      console.error('Error leaving moment:', error);
      toast({
        title: "Errore",
        description: "Errore nel lasciare il momento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  return {
    moments,
    isLoading,
    hasMore,
    filters,
    loadMoments,
    loadUserMoments,
    applyFilters,
    loadMore,
    joinMoment,
    leaveMoment
  };
}