import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { AIHeroSection } from '@/components/discover/AIHeroSection';
import { AIDiscoveryCarousels } from '@/components/discover/AIDiscoveryCarousels';
import { AIResponseRenderer } from '@/components/discover/AIResponseRenderer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export default function Esplora() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCarousels, setShowCarousels] = useState(false);

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
      
      // Show carousels after first interaction
      setShowCarousels(true);
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

      <div className="min-h-screen bg-background">
        {/* Hero Section with AI Chat and Messages */}
        <div className="relative">
          <AIHeroSection onSendMessage={onSendMessage} loading={loading} />
          
          {/* Chat Messages Display - Immediately below hero */}
          {messages.length > 0 && (
            <div className="container mx-auto px-4 -mt-20 relative z-20">
              <div className="max-w-2xl mx-auto">
                <ScrollArea className="max-h-80 w-full rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm p-4 shadow-elevated">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-lg shadow-card ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-border/50'
                          }`}
                        >
                          <AIResponseRenderer content={message.content} />
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-background border border-border/50 p-3 rounded-lg shadow-card">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">L'AI sta pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        {/* AI-Powered Discovery Carousels */}
        <div className="container mx-auto px-4 mt-12">
          <AIDiscoveryCarousels />
        </div>

        {/* Bottom spacing */}
        <div className="h-16" />
      </div>
    </>
  );
}