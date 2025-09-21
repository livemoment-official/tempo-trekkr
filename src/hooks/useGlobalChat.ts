import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useGlobalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;
    
    setLoading(true);
    const newMessage: ChatMessage = { 
      role: 'user', 
      content, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, newMessage]);

    try {
      console.log('Sending message to AI:', newMessage);
      const response = await supabase.functions.invoke('ai-explore', {
        body: { messages: [...messages, newMessage] }
      });

      console.log('AI response:', response);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.data?.message || 'Mi dispiace, non riesco a rispondere al momento. Riprova più tardi.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Si è verificato un errore. Riprova più tardi.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearChat
  };
};