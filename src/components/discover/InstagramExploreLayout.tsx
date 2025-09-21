import React, { useState } from 'react';
import { DiscoveryGrid } from './DiscoveryGrid';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3X3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompactInputBar } from './CompactInputBar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InstagramExploreLayoutProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export const InstagramExploreLayout: React.FC<InstagramExploreLayoutProps> = ({
  messages,
  onSendMessage,
  loading
}) => {
  const [showChat, setShowChat] = useState(false);
  const hasMessages = messages.length > 0;

  const handleSendMessage = (message: string) => {
    setShowChat(true);
    onSendMessage(message);
  };

  const handleBackToGrid = () => {
    setShowChat(false);
  };

  return (
    <div className="relative">
      {/* Header - Only show when in chat mode */}
      {showChat && hasMessages && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border mb-4">
          <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToGrid}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Torna alla Griglia</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="relative min-h-[60vh]">
        {/* Discovery Grid - Always rendered but hidden when chat is active */}
        <div className={cn(
          "transition-all duration-300",
          showChat && hasMessages ? "opacity-20 pointer-events-none" : "opacity-100"
        )}>
          <DiscoveryGrid />
        </div>
        
        {/* Chat Interface - Overlay when active */}
        {showChat && hasMessages && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-lg">
            <ChatInterface messages={messages} loading={loading} />
          </div>
        )}
      </div>
      
      {/* Chat Input - Always visible at bottom */}
      <div className="mt-6 pt-4 border-t border-border/50 bg-background/95">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Chiedi all'AI cosa vuoi fare</span>
        </div>
        <CompactInputBar onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
};