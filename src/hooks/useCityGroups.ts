import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CityGroup {
  id: string;
  city_name: string;
  description: string | null;
  participants: string[];
  participant_count: number;
  is_member: boolean;
}

export function useCityGroups() {
  const { user } = useAuth();
  const [cityGroups, setCityGroups] = useState<Map<string, CityGroup>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const loadCityGroup = async (cityName: string) => {
    try {
      const { data, error } = await supabase
        .from('city_groups')
        .select('*')
        .eq('city_name', cityName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading city group:', error);
        return null;
      }

      if (data) {
        const cityGroup: CityGroup = {
          id: data.id,
          city_name: data.city_name,
          description: data.description,
          participants: data.participants || [],
          participant_count: (data.participants || []).length,
          is_member: user ? (data.participants || []).includes(user.id) : false
        };
        
        setCityGroups(prev => new Map(prev).set(cityName, cityGroup));
        return cityGroup;
      }

      return null;
    } catch (error) {
      console.error('Error loading city group:', error);
      return null;
    }
  };

  const joinCityGroup = async (cityName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('join_city_group', {
        target_city_name: cityName
      });

      if (error) {
        console.error('Error joining city group:', error);
        return false;
      }

      // Reload the city group
      await loadCityGroup(cityName);
      return true;
    } catch (error) {
      console.error('Error joining city group:', error);
      return false;
    }
  };

  const leaveCityGroup = async (cityName: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('leave_city_group', {
        target_city_name: cityName
      });

      if (error) {
        console.error('Error leaving city group:', error);
        return false;
      }

      // Reload the city group
      await loadCityGroup(cityName);
      return true;
    } catch (error) {
      console.error('Error leaving city group:', error);
      return false;
    }
  };

  return {
    cityGroups,
    isLoading,
    loadCityGroup,
    joinCityGroup,
    leaveCityGroup
  };
}
