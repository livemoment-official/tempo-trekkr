import React, { useState } from 'react';
import { DiscoveryGrid } from './DiscoveryGrid';
import { BottomChatBar } from './BottomChatBar';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header - Only show when in chat mode */}
      {showChat && hasMessages && (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
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
      <div className="flex-1 relative">
        {/* Discovery Grid - Always rendered but hidden when chat is active */}
        <div className={cn(
          "transition-all duration-300",
          showChat && hasMessages ? "opacity-20 pointer-events-none" : "opacity-100"
        )}>
          <DiscoveryGrid />
        </div>
        
        {/* Chat Interface - Overlay when active */}
        {showChat && hasMessages && (
          <div className="absolute inset-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <ChatInterface messages={messages} loading={loading} />
          </div>
        )}
      </div>
      
      {/* Bottom Chat Bar - Always visible and fixed */}
      <BottomChatBar onSendMessage={handleSendMessage} disabled={loading} />
    </div>
  );
};