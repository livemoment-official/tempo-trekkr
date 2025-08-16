import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  read_at?: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export function useChat(conversationId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load conversations for current user
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get other participants info and mock data for now
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherParticipantId = conv.participant_1 === user.id 
            ? conv.participant_2 
            : conv.participant_1;

          const { data: participantData } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', otherParticipantId)
            .single();

          return {
            ...conv,
            other_participant: participantData,
            last_message: undefined,
            unread_count: 0
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle conversazioni",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Load messages for specific conversation
  const loadMessages = useCallback(async (convId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get sender info for each message
      const messagesWithSenders = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', msg.sender_id)
            .single();

          return {
            ...msg,
            sender: senderData
          };
        })
      );

      setMessages(messagesWithSenders);

      // Mark messages as read
      const unreadMessages = messagesData?.filter(
        msg => msg.sender_id !== user.id && !msg.read_at
      );

      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(msg => msg.id));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento dei messaggi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Send message
  const sendMessage = useCallback(async (content: string, convId: string) => {
    if (!user || !content.trim()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: content.trim(),
          sender_id: user.id,
          conversation_id: convId
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Errore",
        description: "Errore nell'invio del messaggio",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [user, toast]);

  // Create or get conversation
  const createOrGetConversation = useCallback(async (otherUserId: string) => {
    if (!user || user.id === otherUserId) return null;

    try {
      // Check if conversation already exists
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') throw searchError;

      if (existingConv) {
        return existingConv;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: otherUserId
        })
        .select()
        .single();

      if (createError) throw createError;

      return newConv;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      toast({
        title: "Errore",
        description: "Errore nella creazione della conversazione",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages in current conversation
    if (conversationId) {
      const messagesSubscription = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          async (payload) => {
            // Get sender info
            const { data: senderData } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();

            const newMessage = {
              ...payload.new,
              sender: senderData
            } as Message;

            setMessages(prev => [...prev, newMessage]);

            // Mark as read if not sent by current user
            if (payload.new.sender_id !== user.id) {
              await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', payload.new.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messagesSubscription);
      };
    }

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel('conversations:user')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1.eq.${user.id},participant_2.eq.${user.id})`
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, conversationId, loadConversations]);

  return {
    messages,
    conversations,
    isLoading,
    isSending,
    loadConversations,
    loadMessages,
    sendMessage,
    createOrGetConversation
  };
}