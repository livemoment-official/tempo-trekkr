import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArtistProfile {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  genres?: string[];
  location?: any;
  contact_info?: any;
  pricing?: any;
  availability?: any;
  verified: boolean;
  created_at: string;
  updated_at: string;
  stage_name?: string;
  artist_type?: string;
  specialization?: string;
  experience_years?: number;
  instruments?: string[];
  audience_size?: string;
  performance_duration?: string;
  profile_video_url?: string;
  cachet_info?: any;
  // Add completeness score
  completeness_score?: number;
  is_complete?: boolean;
}

// Calculate profile completeness score (0-100)
export const calculateArtistCompleteness = (artist: any): number => {
  let score = 0;
  const maxScore = 100;
  
  // Essential fields (60 points)
  if (artist.name) score += 15;
  if (artist.bio && artist.bio.length >= 50) score += 15;
  if (artist.genres && artist.genres.length >= 2) score += 15;
  if (artist.artist_type) score += 15;
  
  // Important fields (30 points)
  if (artist.avatar_url) score += 10;
  if (artist.stage_name) score += 5;
  if (artist.experience_years) score += 5;
  if (artist.specialization) score += 5;
  if (artist.instruments && artist.instruments.length > 0) score += 5;
  
  // Additional fields (10 points)
  if (artist.profile_video_url) score += 5;
  if (artist.audience_size) score += 3;
  if (artist.performance_duration) score += 2;
  
  return Math.min(score, maxScore);
};

// Check if profile meets minimum standards for event selection
export const isArtistProfileComplete = (artist: any): boolean => {
  return (
    artist.name && 
    artist.bio && artist.bio.length >= 30 &&
    artist.genres && artist.genres.length >= 1 &&
    artist.artist_type
  );
};

export function useQualityArtists(options?: {
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
    queryKey: ['quality-artists', { onlyComplete, onlyVerified, minCompletenessScore }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('verified', { ascending: false })
        .order('name');
      
      if (error) throw error;

      // Process and filter artists
      const processedArtists = data.map(artist => {
        const completeness_score = calculateArtistCompleteness(artist);
        const is_complete = isArtistProfileComplete(artist);
        
        return {
          ...artist,
          completeness_score,
          is_complete
        } as ArtistProfile;
      });

      // Apply filters
      let filteredArtists = processedArtists;

      if (onlyComplete) {
        filteredArtists = filteredArtists.filter(artist => artist.is_complete);
      }

      if (onlyVerified) {
        filteredArtists = filteredArtists.filter(artist => artist.verified);
      }

      if (minCompletenessScore > 0) {
        filteredArtists = filteredArtists.filter(artist => 
          artist.completeness_score >= minCompletenessScore
        );
      }

      // Sort by quality: verified first, then by completeness score
      return filteredArtists.sort((a, b) => {
        if (a.verified && !b.verified) return -1;
        if (!a.verified && b.verified) return 1;
        return (b.completeness_score || 0) - (a.completeness_score || 0);
      });
    },
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const completeness_score = calculateArtistCompleteness(data);
      const is_complete = isArtistProfileComplete(data);
      
      return {
        ...data,
        completeness_score,
        is_complete
      } as ArtistProfile;
    },
    enabled: !!id,
  });
}