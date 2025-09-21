import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  sender_info: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  group_info: {
    id: string;
    title: string;
  };
  created_at: string;
}

interface GroupChatInfo {
  id: string;
  title: string;
  type: 'moment' | 'event' | 'city' | 'group';
  participant_count: number;
  event_date?: string;
  location?: string;
  subtitle?: string;
  date?: string;
  time?: string;
  memberCount?: number;
}

export function useGroupChat(groupType: 'moment' | 'event' | 'city' | 'group', groupId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupChatInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Auto-load group info when groupType or groupId changes
  useEffect(() => {
    if (groupId && groupType) {
      console.log('Loading group info for:', { groupType, groupId });
      loadGroupInfo();
    }
  }, [groupType, groupId]);

  // Auto-load messages when groupInfo is available
  useEffect(() => {
    if (groupInfo && groupId) {
      console.log('Loading messages for group:', groupInfo.title);
      loadMessages();
    }
  }, [groupInfo, groupId]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!groupId) return;

    console.log('Setting up real-time subscription for group:', groupId);
    const channel = supabase
      .channel(`group_messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          if (payload.new) {
            // Get sender profile for the new message
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            const newMessage: GroupMessage = {
              id: payload.new.id,
              content: payload.new.content,
              sender_id: payload.new.sender_id,
              sender_info: {
                id: payload.new.sender_id,
                name: profile?.name || 'Utente',
                avatar_url: profile?.avatar_url,
              },
              group_info: {
                id: groupId,
                title: groupInfo?.title || 'Chat di gruppo',
              },
              created_at: payload.new.created_at,
            };

            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [groupId, groupInfo]);

  const loadGroupInfo = async () => {
    try {
      let data, error;
      
      switch (groupType) {
        case 'moment':
          ({ data, error } = await supabase
            .from('moments')
            .select('*')
            .eq('id', groupId)
            .single());
          break;
        case 'event':
          ({ data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', groupId)
            .single());
          break;
        case 'group':
          ({ data, error } = await supabase
            .from('groups')
            .select('*')
            .eq('id', groupId)
            .single());
          break;
        case 'city':
          // For city groups, we might need a different approach
          return;
      }

      if (error) throw error;

      if (data) {
        const eventDate = data.when_at ? new Date(data.when_at) : null;
        setGroupInfo({
          id: data.id,
          title: data.title,
          type: groupType,
          participant_count: data.participants?.length || 0,
          event_date: data.when_at,
          location: data.place?.name || data.location?.name || '',
          subtitle: data.description || `Chat di ${groupType}`,
          date: eventDate ? eventDate.toLocaleDateString('it-IT') : undefined,
          time: eventDate ? eventDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : undefined,
          memberCount: data.participants?.length || 0,
        });
      }
    } catch (error) {
      console.error('Error loading group info:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get unique sender IDs to fetch profiles
      const senderIds = [...new Set(data?.map(msg => msg.sender_id) || [])];
      
      // Fetch profiles for all senders
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', senderIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const formattedMessages: GroupMessage[] = data?.map(msg => {
        const profile = profilesMap.get(msg.sender_id);
        return {
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_info: {
            id: msg.sender_id,
            name: profile?.name || 'Utente',
            avatar_url: profile?.avatar_url,
          },
          group_info: {
            id: groupId,
            title: groupInfo?.title || 'Chat di gruppo',
          },
          created_at: msg.created_at,
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .single();

      if (error) throw error;

      if (data) {
        // Get sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', data.sender_id)
          .single();

        const newMessage: GroupMessage = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          sender_info: {
            id: data.sender_id,
            name: profile?.name || 'Tu',
            avatar_url: profile?.avatar_url,
          },
          group_info: {
            id: groupId,
            title: groupInfo?.title || 'Chat di gruppo',
          },
          created_at: data.created_at,
        };

        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    groupInfo,
    isLoading,
    isSending,
    sendMessage,
    loadMessages,
    loadGroupInfo
  };
}