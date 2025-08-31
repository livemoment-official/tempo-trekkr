import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Group {
  id: string;
  title: string;
  description?: string;
  category: string;
  location?: any; // Using any to match Json type from Supabase
  host_id: string;
  participants: string[];
  max_participants?: number;
  is_public: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPublicGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading public groups:', error);
    }
  };

  const loadUserGroups = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .or(`host_id.eq.${user.id},participants.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserGroups(data || []);
    } catch (error) {
      console.error('Error loading user groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user?.id) return false;

    try {
      // Get current group data
      const { data: group, error: fetchError } = await supabase
        .from('groups')
        .select('participants')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      const currentParticipants = group.participants || [];
      
      // Check if already a participant
      if (currentParticipants.includes(user.id)) {
        return true; // Already joined
      }

      // Add user to participants
      const { error } = await supabase
        .from('groups')
        .update({
          participants: [...currentParticipants, user.id]
        })
        .eq('id', groupId);

      if (error) throw error;

      // Refresh user groups
      await loadUserGroups();
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user?.id) return false;

    try {
      // Get current group data
      const { data: group, error: fetchError } = await supabase
        .from('groups')
        .select('participants, host_id')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      // Can't leave if you're the host
      if (group.host_id === user.id) {
        return false;
      }

      const currentParticipants = group.participants || [];
      
      // Remove user from participants
      const { error } = await supabase
        .from('groups')
        .update({
          participants: currentParticipants.filter(id => id !== user.id)
        })
        .eq('id', groupId);

      if (error) throw error;

      // Refresh user groups
      await loadUserGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  };

  useEffect(() => {
    loadPublicGroups();
    loadUserGroups();
  }, [user?.id]);

  // Set up real-time subscription for groups
  useEffect(() => {
    const subscription = supabase
      .channel('groups_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups' },
        () => {
          loadPublicGroups();
          loadUserGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  return {
    groups,
    userGroups,
    isLoading,
    joinGroup,
    leaveGroup,
    loadPublicGroups,
    loadUserGroups
  };
}