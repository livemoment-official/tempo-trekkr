import React from 'react';
import { AIHeroSection } from './AIHeroSection';
import { CompactInputBar } from './CompactInputBar';
import { ChatInterface } from './ChatInterface';
import { AIDiscoveryCarousels } from './AIDiscoveryCarousels';

interface ConversationalExploreLayoutProps {
  messages: { role: 'user' | 'assistant'; content: string }[];
  onSendMessage: (message: string) => void;
  loading: boolean;
}

export function ConversationalExploreLayout({
  messages,
  onSendMessage,
  loading
}: ConversationalExploreLayoutProps) {
  const isInConversation = messages.length > 0;

  if (!isInConversation) {
    // Initial state: Show full hero section
    return (
      <div className="min-h-screen bg-background">
        <AIHeroSection onSendMessage={onSendMessage} loading={loading} />
        
        {/* Discovery Carousels */}
        <div className="container mx-auto px-4 py-12">
          <AIDiscoveryCarousels />
        </div>
      </div>
    );
  }

  // Conversation state: ChatGPT-like interface
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact Input Bar at Top */}
      <CompactInputBar onSendMessage={onSendMessage} loading={loading} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex">
        {/* Chat Interface - Main Area */}
        <div className="flex-1 flex flex-col">
          <ChatInterface messages={messages} loading={loading} />
        </div>
        
        {/* Discovery Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden xl:block w-80 border-l border-border/50 bg-card/30">
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
              Scopri di più
            </h3>
            <div className="scale-75 origin-top-left w-[133%]">
              <AIDiscoveryCarousels />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}