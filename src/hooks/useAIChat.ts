import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatOptions {
  includeMoments?: boolean;
  includeProfile?: boolean;
}

export function useAIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Ciao! Sono il tuo assistente AI per LiveMoment. Come posso aiutarti oggi? 😊",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, options: ChatOptions = {}) => {
    if (!user || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content.trim(),
          context: {
            includeMoments: options.includeMoments,
            includeProfile: options.includeProfile,
          }
        }
      });

      if (error) throw error;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Mi dispiace, ho avuto un problema nel rispondere. Riprova tra poco! 😅",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Ciao! Sono il tuo assistente AI per LiveMoment. Come posso aiutarti oggi? 😊",
        sender: 'ai',
        timestamp: new Date(),
      }
    ]);
  };

  const getSuggestions = () => {
    return [
      "Come posso creare un momento interessante?",
      "Suggeriscimi attività per il weekend",
      "Come posso incontrare persone con i miei interessi?",
      "Aiutami a scrivere una bio accattivante",
      "Che tipo di foto dovrei caricare nel profilo?",
    ];
  };

  return {
    messages,
    sendMessage,
    clearChat,
    getSuggestions,
    isLoading,
  };
}