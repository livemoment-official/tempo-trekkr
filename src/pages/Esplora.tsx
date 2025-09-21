import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { ConversationalExploreLayout } from '@/components/discover/ConversationalExploreLayout';

export default function Esplora() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const onSendMessage = async (message: string) => {
    if (!message.trim() || loading) return;
    
    setLoading(true);
    const newMessage = { role: 'user' as const, content: message };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await supabase.functions.invoke('ai-explore', {
        body: { messages: [...messages, newMessage] }
      });

      if (response.data?.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Mi dispiace, non riesco a rispondere al momento. Riprova più tardi.' }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Si è verificato un errore. Riprova più tardi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Esplora - Live Moment</title>
        <meta name="description" content="Scopri il tuo prossimo momento perfetto con l'aiuto dell'AI. Trova persone, eventi, luoghi e artisti su misura per te." />
      </Helmet>

      <ConversationalExploreLayout
        messages={messages}
        onSendMessage={onSendMessage}
        loading={loading}
      />
    </>
  );
}