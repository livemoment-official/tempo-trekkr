import React from 'react';
import { ChatInterface } from './ChatInterface';
import { DiscoveryGrid } from './DiscoveryGrid';
import { ChatMessage } from '@/hooks/useGlobalChat';

interface InstagramExploreLayoutProps {
  messages: ChatMessage[];
  onSendMessage?: (message: string) => void;
  loading: boolean;
}

export const InstagramExploreLayout: React.FC<InstagramExploreLayoutProps> = ({
  messages,
  loading
}) => {
  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-full bg-background pb-24"> {/* Extra padding for fixed input */}
      {hasMessages ? (
        /* Chat Interface - When conversation started */
        <ChatInterface messages={messages} loading={loading} />
      ) : (
        /* Discovery Grid - Initial state */
        <DiscoveryGrid />
      )}
    </div>
  );
};