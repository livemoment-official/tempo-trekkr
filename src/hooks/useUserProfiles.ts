import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
}

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
}

export interface StaffProfile {
  id: string;
  user_id: string;
  name: string;
  role: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  contact_info?: any;
  avatar_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export type ProfileType = 'artist' | 'venue' | 'staff';

export interface UserProfiles {
  artists: ArtistProfile[];
  venues: VenueProfile[];
  staff: StaffProfile[];
}

export function useUserProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfiles>({
    artists: [],
    venues: [],
    staff: []
  });
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all profile types in parallel
      const [artistsResult, venuesResult, staffResult] = await Promise.all([
        supabase
          .from('artists')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('venues')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('staff_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (artistsResult.error) throw artistsResult.error;
      if (venuesResult.error) throw venuesResult.error;
      if (staffResult.error) throw staffResult.error;

      setProfiles({
        artists: artistsResult.data || [],
        venues: venuesResult.data || [],
        staff: staffResult.data || []
      });
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Errore nel caricamento dei profili');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const createArtistProfile = async (data: Omit<ArtistProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => {
    if (!user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('artists')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo artista creato con successo');
      return profile;
    } catch (error) {
      console.error('Error creating artist profile:', error);
      toast.error('Errore nella creazione del profilo artista');
      return null;
    }
  };

  const createVenueProfile = async (data: Omit<VenueProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => {
    if (!user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('venues')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo location creato con successo');
      return profile;
    } catch (error) {
      console.error('Error creating venue profile:', error);
      toast.error('Errore nella creazione del profilo location');
      return null;
    }
  };

  const createStaffProfile = async (data: Omit<StaffProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => {
    if (!user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('staff_profiles')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo staff creato con successo');
      return profile;
    } catch (error) {
      console.error('Error creating staff profile:', error);
      toast.error('Errore nella creazione del profilo staff');
      return null;
    }
  };

  const updateArtistProfile = async (id: string, data: Partial<ArtistProfile>) => {
    try {
      const { error } = await supabase
        .from('artists')
        .update(data)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo artista aggiornato');
    } catch (error) {
      console.error('Error updating artist profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo artista');
    }
  };

  const updateVenueProfile = async (id: string, data: Partial<VenueProfile>) => {
    try {
      const { error } = await supabase
        .from('venues')
        .update(data)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo location aggiornato');
    } catch (error) {
      console.error('Error updating venue profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo location');
    }
  };

  const updateStaffProfile = async (id: string, data: Partial<StaffProfile>) => {
    try {
      const { error } = await supabase
        .from('staff_profiles')
        .update(data)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo staff aggiornato');
    } catch (error) {
      console.error('Error updating staff profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo staff');
    }
  };

  const deleteProfile = async (type: ProfileType, id: string) => {
    try {
      let error;
      
      switch (type) {
        case 'artist':
          ({ error } = await supabase
            .from('artists')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id));
          break;
        case 'venue':
          ({ error } = await supabase
            .from('venues')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id));
          break;
        case 'staff':
          ({ error } = await supabase
            .from('staff_profiles')
            .delete()
            .eq('id', id)
            .eq('user_id', user?.id));
          break;
      }

      if (error) throw error;

      await fetchProfiles();
      toast.success('Profilo eliminato');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Errore nell\'eliminazione del profilo');
    }
  };

  const getTotalProfilesCount = () => {
    return profiles.artists.length + profiles.venues.length + profiles.staff.length;
  };

  return {
    profiles,
    loading,
    fetchProfiles,
    createArtistProfile,
    createVenueProfile,
    createStaffProfile,
    updateArtistProfile,
    updateVenueProfile,
    updateStaffProfile,
    deleteProfile,
    getTotalProfilesCount
  };
}