import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInterface } from '@/components/discover/ChatInterface';
import { AIChatInput } from '@/components/discover/AIChatInput';
import { useGlobalChat } from '@/hooks/useGlobalChat';
export default function EsploraChat() {
  const navigate = useNavigate();
  const {
    messages,
    loading,
    sendMessage
  } = useGlobalChat();
  return <>
      <Helmet>
        <title>Chat AI - Live Moment</title>
        <meta name="description" content="Chatta con l'AI per scoprire il tuo prossimo momento perfetto." />
      </Helmet>

      <div className="flex flex-col h-full">
        {/* Header with back button */}
        

        {/* Chat content - with bottom padding for fixed input */}
        

        {/* AI Chat Input */}
        <AIChatInput onSendMessage={sendMessage} disabled={loading} />
      </div>
    </>;
}