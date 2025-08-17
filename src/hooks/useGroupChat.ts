import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GroupMessage {
  id: string;
  content: string;
  sender_id: string;
  group_id: string;
  group_type: 'moment' | 'event' | 'city';
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface GroupChatInfo {
  id: string;
  title: string;
  subtitle?: string;
  type: 'moment' | 'event' | 'city';
  memberCount?: number;
  location?: string;
  date?: string;
  time?: string;
}

export function useGroupChat(groupType: 'moment' | 'event' | 'city', groupId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupChatInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load group info
  const loadGroupInfo = useCallback(async () => {
    if (!groupId) return;

    try {
      let data, error;
      
      switch (groupType) {
        case 'moment':
          ({ data, error } = await supabase
            .from('moments')
            .select(`
              id,
              title,
              description,
              when_at,
              place,
              participants,
              host_id,
              profiles!moments_host_id_fkey (name)
            `)
            .eq('id', groupId)
            .single());
          break;
            
        case 'event':
          ({ data, error } = await supabase
            .from('events')
            .select(`
              id,
              title,
              description,
              when_at,
              place,
              host_id,
              profiles!events_host_id_fkey (name)
            `)
            .eq('id', groupId)
            .single());
          break;
            
        case 'city':
          // Mock data for city groups
          data = {
            id: groupId,
            title: `Gruppo ${groupId}`,
            description: `Chat di gruppo per la città`
          };
          break;
      }

      if (error && groupType !== 'city') throw error;

      if (data) {
        const info: GroupChatInfo = {
          id: data.id,
          title: data.title || `Gruppo ${groupId}`,
          type: groupType,
          subtitle: data.profiles?.name ? `Organizzato da ${data.profiles.name}` : undefined,
          location: data.place?.name || data.place?.address,
          date: data.when_at ? new Date(data.when_at).toLocaleDateString('it-IT') : undefined,
          time: data.when_at ? new Date(data.when_at).toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : undefined,
          memberCount: data.participants?.length || 0
        };
        
        setGroupInfo(info);
      }
    } catch (error) {
      console.error('Error loading group info:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle informazioni del gruppo",
        variant: "destructive"
      });
    }
  }, [groupId, groupType, toast]);

  // Load group messages (mock implementation - would need dedicated group_messages table)
  const loadMessages = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      // For now, using mock data since we don't have group_messages table
      // In real implementation, you'd create a group_messages table
      const mockMessages: GroupMessage[] = [
        {
          id: '1',
          content: 'Ciao a tutti! Chi viene stasera?',
          sender_id: 'user1',
          group_id: groupId,
          group_type: groupType,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender: {
            id: 'user1',
            name: 'Marco',
            avatar_url: undefined
          }
        },
        {
          id: '2',
          content: 'Io ci sono! A che ora ci troviamo?',
          sender_id: 'user2',
          group_id: groupId,
          group_type: groupType,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender: {
            id: 'user2',
            name: 'Sofia',
            avatar_url: undefined
          }
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading group messages:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei messaggi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [groupId, groupType, toast]);

  // Send group message (mock implementation)
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    setIsSending(true);
    try {
      // Mock implementation - in real app would save to group_messages table
      const newMessage: GroupMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        sender_id: user.id,
        group_id: groupId,
        group_type: groupType,
        created_at: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Tu',
          avatar_url: user.user_metadata?.avatar_url
        }
      };

      setMessages(prev => [...prev, newMessage]);

      toast({
        title: "Messaggio inviato",
        description: "Il tuo messaggio è stato inviato al gruppo"
      });

      return newMessage;
    } catch (error) {
      console.error('Error sending group message:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio del messaggio",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [user, groupId, groupType, toast]);

  // Load data on mount
  useEffect(() => {
    loadGroupInfo();
    loadMessages();
  }, [loadGroupInfo, loadMessages]);

  // Real-time subscriptions (would be implemented with proper group_messages table)
  useEffect(() => {
    if (!user || !groupId) return;

    // For now, no real-time updates since we're using mock data
    // In real implementation, you'd subscribe to group_messages table changes

    return () => {
      // Cleanup subscriptions
    };
  }, [user, groupId]);

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