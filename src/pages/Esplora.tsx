import React from 'react';
import { Helmet } from 'react-helmet-async';
import { InstagramExploreLayout } from '@/components/discover/InstagramExploreLayout';
import { useGlobalChat } from '@/hooks/useGlobalChat';

export default function Esplora() {
  const { messages, loading, sendMessage } = useGlobalChat();

  return (
    <>
      <Helmet>
        <title>Esplora - Live Moment</title>
        <meta name="description" content="Scopri il tuo prossimo momento perfetto con l'aiuto dell'AI. Trova persone, eventi, luoghi e artisti su misura per te." />
      </Helmet>

      <InstagramExploreLayout
        messages={messages}
        onSendMessage={sendMessage}
        loading={loading}
      />
    </>
  );
}