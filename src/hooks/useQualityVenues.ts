import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VenueProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  images?: any;
  location: any;
  capacity?: number;
  contact_info?: any;
  pricing?: any;
  availability?: any;
  amenities?: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
  venue_type?: string;
  services?: string[];
  space_photos?: string[];
  contact_person_name?: string;
  contact_person_surname?: string;
  contact_phone?: string;
  contact_email?: string;
  // Add completeness score
  completeness_score?: number;
  is_complete?: boolean;
}

// Calculate venue profile completeness score (0-100)
export const calculateVenueCompleteness = (venue: any): number => {
  let score = 0;
  const maxScore = 100;
  
  // Essential fields (60 points)
  if (venue.name) score += 15;
  if (venue.description && venue.description.length >= 50) score += 15;
  if (venue.location && venue.location.address) score += 15;
  if (venue.venue_type) score += 15;
  
  // Important fields (30 points)
  if (venue.capacity) score += 10;
  if (venue.amenities && venue.amenities.length >= 3) score += 10;
  if (venue.contact_phone || venue.contact_email) score += 10;
  
  // Additional fields (10 points)
  if (venue.images && venue.images.length > 0) score += 5;
  if (venue.services && venue.services.length > 0) score += 3;
  if (venue.pricing) score += 2;
  
  return Math.min(score, maxScore);
};

// Check if profile meets minimum standards for event selection
export const isVenueProfileComplete = (venue: any): boolean => {
  return (
    venue.name && 
    venue.description && venue.description.length >= 30 &&
    venue.location && venue.location.address &&
    venue.venue_type &&
    (venue.contact_phone || venue.contact_email)
  );
};

export function useQualityVenues(options?: {
  onlyComplete?: boolean;
  onlyVerified?: boolean;
  minCompletenessScore?: number;
}) {
  const {
    onlyComplete = false,
    onlyVerified = false,
    minCompletenessScore = 0
  } = options || {};

  return useQuery({
    queryKey: ['quality-venues', { onlyComplete, onlyVerified, minCompletenessScore }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('verified', { ascending: false })
        .order('name');
      
      if (error) throw error;

      // Process and filter venues
      const processedVenues = data.map(venue => {
        const completeness_score = calculateVenueCompleteness(venue);
        const is_complete = isVenueProfileComplete(venue);
        
        return {
          ...venue,
          completeness_score,
          is_complete
        } as VenueProfile;
      });

      // Apply filters
      let filteredVenues = processedVenues;

      if (onlyComplete) {
        filteredVenues = filteredVenues.filter(venue => venue.is_complete);
      }

      if (onlyVerified) {
        filteredVenues = filteredVenues.filter(venue => venue.verified);
      }

      if (minCompletenessScore > 0) {
        filteredVenues = filteredVenues.filter(venue => 
          venue.completeness_score >= minCompletenessScore
        );
      }

      // Sort by quality: verified first, then by completeness score
      return filteredVenues.sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return (b.completeness_score || 0) - (a.completeness_score || 0);
      });
    },
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const completeness_score = calculateVenueCompleteness(data);
      const is_complete = isVenueProfileComplete(data);
      
      return {
        ...data,
        completeness_score,
        is_complete
      } as VenueProfile;
    },
    enabled: !!id,
  });
}