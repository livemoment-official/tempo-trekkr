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
  unread_count?: number; // FASE 4: Add unread count
  last_message?: string; // FASE 5: Add last message
  last_message_at?: string; // FASE 5: Add last message timestamp
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
      // FASE 4 & 5: Load groups with unread count and last message info
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_messages (
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`host_id.eq.${user.id},participants.cs.{${user.id}}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process groups to add unread count and last message
      const processedGroups = await Promise.all((data || []).map(async (group: any) => {
        // Get unread notifications count for this group
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('type', 'group_message')
          .eq('read', false)
          .eq('data->>group_id', group.id);

        // Get last message from group_messages array
        const messages = group.group_messages || [];
        const sortedMessages = messages.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMessage = sortedMessages[0];

        // Remove group_messages array and add processed fields
        const { group_messages, ...groupWithoutMessages } = group;
        
        return {
          ...groupWithoutMessages,
          unread_count: count || 0,
          last_message: lastMessage?.content,
          last_message_at: lastMessage?.created_at
        };
      }));

      setUserGroups(processedGroups);
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

  // FASE 6: Set up real-time subscriptions for groups and notifications
  useEffect(() => {
    if (!user?.id) return;

    const groupsChannel = supabase
      .channel('groups_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'groups' },
        () => {
          loadPublicGroups();
          loadUserGroups();
        }
      )
      .subscribe();

    const notificationsChannel = supabase
      .channel('group_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new && (payload.new as any).type === 'group_message') {
          // Refresh user groups to update unread counts
          loadUserGroups();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(groupsChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user?.id]);

  const deleteGroup = async (groupId: string) => {
    if (!user?.id) return false;

    try {
      // Check if user is the host
      const { data: group, error: fetchError } = await supabase
        .from('groups')
        .select('host_id')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      if (group.host_id !== user.id) {
        return false; // Only host can delete
      }

      // Delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      // Refresh groups
      await loadPublicGroups();
      await loadUserGroups();
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      return false;
    }
  };

  return {
    groups,
    userGroups,
    isLoading,
    joinGroup,
    leaveGroup,
    deleteGroup,
    loadPublicGroups,
    loadUserGroups
  };
}