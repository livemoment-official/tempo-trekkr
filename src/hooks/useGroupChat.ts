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
}

export function useGroupChat(groupType: 'moment' | 'event' | 'city' | 'group', groupId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupChatInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadGroupInfo = async () => {
    try {
      let query;
      let tableName = '';
      
      switch (groupType) {
        case 'moment':
          tableName = 'moments';
          break;
        case 'event':
          tableName = 'events';
          break;
        case 'group':
          tableName = 'groups';
          break;
        case 'city':
          // For city groups, we might need a different approach
          return;
      }

      query = supabase
        .from(tableName)
        .select('*')
        .eq('id', groupId)
        .single();

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setGroupInfo({
          id: data.id,
          title: data.title,
          type: groupType,
          participant_count: data.participants?.length || 0,
          event_date: data.when_at,
          location: data.place?.name || data.location?.name || '',
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
          created_at,
          profiles!sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: GroupMessage[] = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_info: {
          id: msg.profiles?.id || msg.sender_id,
          name: msg.profiles?.name || 'Utente',
          avatar_url: msg.profiles?.avatar_url,
        },
        group_info: {
          id: groupId,
          title: groupInfo?.title || 'Chat di gruppo',
        },
        created_at: msg.created_at,
      })) || [];

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
          created_at,
          profiles!sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        const newMessage: GroupMessage = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          sender_info: {
            id: data.profiles?.id || data.sender_id,
            name: data.profiles?.name || 'Tu',
            avatar_url: data.profiles?.avatar_url,
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