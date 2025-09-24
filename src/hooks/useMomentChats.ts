import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MomentChat {
  id: string;
  title: string;
  participants: number;
  lastMessage?: string;
  time?: string;
  unread: number;
  when_at?: string;
  place?: any;
}

export function useMomentChats() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [momentChats, setMomentChats] = useState<MomentChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMomentChats = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get moments where user is host or participant
      const { data: momentsData, error: momentsError } = await supabase
        .from('moments')
        .select('id, title, participants, when_at, place, created_at')
        .or(`host_id.eq.${user.id},participants.cs.{${user.id}}`)
        .eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (momentsError) throw momentsError;

      // For each moment, get the latest message from group chat (if exists)
      const momentChatsWithMessages = await Promise.all(
        (momentsData || []).map(async (moment) => {
          const { data: lastMessage } = await supabase
            .from('group_messages')
            .select('content, created_at')
            .eq('group_id', moment.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: moment.id,
            title: moment.title,
            participants: Array.isArray(moment.participants) ? moment.participants.length : 0,
            lastMessage: lastMessage?.content || 'Nessun messaggio',
            time: lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit'
            }) : '',
            unread: 0, // TODO: Implement unread count
            when_at: moment.when_at,
            place: moment.place
          };
        })
      );

      setMomentChats(momentChatsWithMessages);
    } catch (error) {
      console.error('Error loading moment chats:', error);
      toast({
        title: "Errore",
        description: "Errore nel caricamento delle chat dei momenti",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadMomentChats();
  }, [loadMomentChats]);

  return {
    momentChats,
    isLoading,
    loadMomentChats
  };
}