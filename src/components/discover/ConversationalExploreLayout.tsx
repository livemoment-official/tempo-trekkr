import React from 'react';
import { CompactInputBar } from './CompactInputBar';
import { ChatInterface } from './ChatInterface';
import { AIHeroSection } from './AIHeroSection';
import { ChatMessage } from '@/hooks/useGlobalChat';

interface ConversationalExploreLayoutProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export const ConversationalExploreLayout: React.FC<ConversationalExploreLayoutProps> = ({
  messages,
  onSendMessage,
  loading
}) => {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Compact Input Bar - Always visible at top */}
      <CompactInputBar onSendMessage={onSendMessage} disabled={loading} />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {hasMessages ? (
          /* Chat Interface - When conversation started */
          <ChatInterface messages={messages} loading={loading} />
        ) : (
          /* Hero Section - Initial state */
          <div className="h-full overflow-y-auto">
            <AIHeroSection onSendMessage={onSendMessage} loading={loading} />
          </div>
        )}
      </div>
    </div>
  );
};