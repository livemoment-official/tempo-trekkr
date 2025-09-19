import React, { useState, useCallback } from 'react';
import { InviteSwipeCard } from './InviteSwipeCard';
import { Button } from '@/components/ui/button';
import { RotateCcw, Mail, Heart, Check } from 'lucide-react';

interface SwipeInvite {
  id: string;
  title: string;
  description?: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  when_at?: string;
  place?: {
    name: string;
  };
  participants?: any[];
  created_at: string;
  status: string;
  response_message?: string;
}

interface InviteSwipeInterfaceProps {
  invites: SwipeInvite[];
  onAccept: (inviteId: string) => void;
  onReject: (inviteId: string) => void;
}

export function InviteSwipeInterface({ invites, onAccept, onReject }: InviteSwipeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedInvites, setProcessedInvites] = useState<Set<string>>(new Set());
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  // Filter out processed invites and get current stack
  const availableInvites = invites.filter(invite => 
    !processedInvites.has(invite.id) && invite.status === 'pending'
  );
  const displayInvites = availableInvites.slice(currentIndex, currentIndex + 3);

  const handleSwipeLeft = useCallback((inviteId: string) => {
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return;

    setAnimatingCard(inviteId);
    onReject(inviteId);
    setProcessedInvites(prev => new Set([...prev, inviteId]));
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingCard(null);
    }, 300);
  }, [invites, onReject]);

  const handleSwipeRight = useCallback((inviteId: string) => {
    const invite = invites.find(i => i.id === inviteId);
    if (!invite) return;

    setAnimatingCard(inviteId);
    onAccept(inviteId);
    setProcessedInvites(prev => new Set([...prev, inviteId]));
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingCard(null);
    }, 300);
  }, [invites, onAccept]);

  const resetStack = useCallback(() => {
    setCurrentIndex(0);
    setProcessedInvites(new Set());
    setAnimatingCard(null);
  }, []);

  if (availableInvites.length === 0 || currentIndex >= availableInvites.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center px-6">
        <div className="bg-primary/10 rounded-full p-6 mb-6">
          <Mail className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {processedInvites.size > 0 ? "Tutti gli inviti gestiti!" : "Nessun invito in attesa"}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {processedInvites.size > 0 
            ? "Hai risposto a tutti gli inviti in attesa. Ottimo lavoro!"
            : "Non hai inviti in attesa al momento. Torna più tardi per controllare!"
          }
        </p>
        <div className="space-y-3 w-full max-w-xs">
          {processedInvites.size > 0 && (
            <Button onClick={resetStack} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rivedi Inviti
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[600px] max-h-[calc(100vh-200px)] overflow-hidden">
      {/* Cards Stack */}
      <div className="relative h-full w-full">
        {displayInvites.map((invite, index) => (
          <InviteSwipeCard
            key={invite.id}
            invite={invite}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isTop={index === 0}
            className={animatingCard === invite.id ? "animate-fade-out" : ""}
            style={{
              zIndex: displayInvites.length - index,
              scale: index === 0 ? 1 : 0.95 - (index * 0.03),
              opacity: index === 0 ? 1 : 0.7 - (index * 0.2),
            }}
          />
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white text-sm font-medium">
            {Math.min(currentIndex + 1, availableInvites.length)} / {availableInvites.length}
          </span>
        </div>
      </div>

      {/* Instructions */}
      {currentIndex === 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none px-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-6 py-3 text-center animate-pulse max-w-sm">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-lg">←</span>
                <span className="text-xs font-medium">Rifiuta</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <span className="text-xs font-medium">Accetta</span>
                <span className="text-lg">→</span>
              </div>
            </div>
            <p className="text-white text-xs">
              Scorri per rispondere agli inviti
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons for accessibility */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => displayInvites[0] && handleSwipeLeft(displayInvites[0].id)}
          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 shadow-lg"
          disabled={!displayInvites[0]}
        >
          <span className="text-2xl">✕</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => displayInvites[0] && handleSwipeRight(displayInvites[0].id)}
          className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 shadow-lg"
          disabled={!displayInvites[0]}
        >
          <Check className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}