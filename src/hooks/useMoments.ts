import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "./useGeolocation";
import { useUserLocation } from "./useUserLocation";

export interface Moment {
  id: string;
  title: string;
  description?: string;
  when_at?: string;
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
  participants: string[];
  max_participants?: number;
  capacity?: number;
  mood_tag?: string;
  tags?: string[];
  photos?: string[];
  is_public: boolean;
  age_range_min?: number;
  age_range_max?: number;
  registration_status: string;
  created_at: string;
  updated_at: string;
  distance_km?: number;
  participant_count?: number;
}

export interface MomentsFilters {
  category?: string;
  mood?: string;
  ageMin?: number;
  ageMax?: number;
  maxDistance?: number;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  showOnlyJoined?: boolean;
}

export function useMoments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { location } = useGeolocation();
  const { getUserLocation } = useUserLocation();
  
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<MomentsFilters>({});

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
        .select(`
          *,
          host:profiles!moments_host_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(currentPage * pageSize, (currentPage + 1) * pageSize - 1);

      // Apply filters
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

      const { data, error } = await query;

      if (error) throw error;

      let processedMoments = (data || []).map(moment => {
        // Cast place to proper type and ensure it has required properties
        const place = moment.place as any;
        const validPlace = place && typeof place === 'object' && place.lat && place.lng 
          ? {
              lat: Number(place.lat),
              lng: Number(place.lng),
              name: place.name || '',
              address: place.address
            }
          : undefined;

        // Handle host data safely
        const host = (moment.host && typeof moment.host === 'object' && moment.host !== null && 'id' in moment.host)
          ? (moment.host as any)
          : undefined;

        return {
          ...moment,
          place: validPlace,
          host: host
        };
      }) as unknown as Moment[];

      // Add distance calculation if user location is available
      const userLoc = location || await getUserLocation();
      if (userLoc && processedMoments.length > 0) {
        processedMoments = processedMoments.map(moment => {
          if (moment.place && typeof moment.place === 'object') {
            const place = moment.place as any;
            if (place.lat && place.lng) {
              const distance = calculateDistance(
                userLoc.lat,
                userLoc.lng,
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

      // Add participant count
      processedMoments = processedMoments.map(moment => ({
        ...moment,
        participant_count: moment.participants?.length || 0
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
  }, [filters, page, location, getUserLocation, toast]);

  // Load user's joined moments
  const loadUserMoments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('moments')
        .select(`
          *,
          host:profiles!moments_host_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .or(`host_id.eq.${user.id},participants.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedMoments = (data || []).map(moment => {
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

        return {
          ...moment,
          place: validPlace,
          host: moment.host || undefined,
          participant_count: moment.participants?.length || 0
        };
      }) as unknown as Moment[];

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

  // Join moment
  const joinMoment = useCallback(async (momentId: string) => {
    if (!user) return false;

    try {
      // Get current moment
      const { data: moment, error: fetchError } = await supabase
        .from('moments')
        .select('participants, max_participants')
        .eq('id', momentId)
        .single();

      if (fetchError) throw fetchError;

      const currentParticipants = moment.participants || [];
      if (currentParticipants.includes(user.id)) {
        toast({
          title: "Già partecipante",
          description: "Sei già registrato a questo momento"
        });
        return false;
      }

      if (moment.max_participants && currentParticipants.length >= moment.max_participants) {
        toast({
          title: "Momento completo",
          description: "Questo momento ha raggiunto il numero massimo di partecipanti",
          variant: "destructive"
        });
        return false;
      }

      // Add user to participants
      const { error } = await supabase
        .from('moments')
        .update({
          participants: [...currentParticipants, user.id]
        })
        .eq('id', momentId);

      if (error) throw error;

      // Update local state
      setMoments(prev => prev.map(m => 
        m.id === momentId 
          ? { 
              ...m, 
              participants: [...currentParticipants, user.id],
              participant_count: currentParticipants.length + 1
            }
          : m
      ));

      toast({
        title: "Partecipazione confermata!",
        description: "Ti sei unito al momento con successo"
      });

      return true;
    } catch (error) {
      console.error('Error joining moment:', error);
      toast({
        title: "Errore",
        description: "Errore nell'unirsi al momento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  // Leave moment
  const leaveMoment = useCallback(async (momentId: string) => {
    if (!user) return false;

    try {
      const { data: moment, error: fetchError } = await supabase
        .from('moments')
        .select('participants')
        .eq('id', momentId)
        .single();

      if (fetchError) throw fetchError;

      const currentParticipants = moment.participants || [];
      const newParticipants = currentParticipants.filter(id => id !== user.id);

      const { error } = await supabase
        .from('moments')
        .update({
          participants: newParticipants
        })
        .eq('id', momentId);

      if (error) throw error;

      // Update local state
      setMoments(prev => prev.map(m => 
        m.id === momentId 
          ? { 
              ...m, 
              participants: newParticipants,
              participant_count: newParticipants.length
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