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
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">AI</span>
              </div>
              <div>
                <h1 className="font-semibold text-sm">Chat AI</h1>
                <p className="text-xs text-muted-foreground">Assistente AI di LiveMoment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat content - with bottom padding for fixed input */}
        <div className="flex-1 pb-20 overflow-y-auto">
          <ChatInterface messages={messages} loading={loading} />
        </div>

        {/* AI Chat Input */}
        <AIChatInput onSendMessage={sendMessage} disabled={loading} />
      </div>
    </>;
}