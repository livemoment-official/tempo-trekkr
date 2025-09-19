import React, { useState, useCallback } from 'react';
import { SwipeUserCard } from './SwipeUserCard';
import { Button } from '@/components/ui/button';
import { RotateCcw, Users, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SwipeUser {
  id: string;
  name: string;
  avatar_url?: string;
  city: string;
  is_available: boolean;
  preferred_moments: string[];
  age?: number;
  distance_km?: number;
}

interface SwipeInterfaceProps {
  users: SwipeUser[];
  onInvite: (userId: string, userName: string) => void;
  onPass: (userId: string) => void;
}

export function SwipeInterface({ users, onInvite, onPass }: SwipeInterfaceProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passedUsers, setPassedUsers] = useState<Set<string>>(new Set());
  const [animatingCard, setAnimatingCard] = useState<string | null>(null);

  // Filter out passed users and get current stack
  const availableUsers = users.filter(user => !passedUsers.has(user.id));
  const displayUsers = availableUsers.slice(currentIndex, currentIndex + 3);

  const handleSwipeLeft = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setAnimatingCard(userId);
    onPass(userId);
    setPassedUsers(prev => new Set([...prev, userId]));
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setAnimatingCard(null);
    }, 300);
  }, [users, onPass]);

  const handleSwipeRight = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setAnimatingCard(userId);
    onInvite(userId, user.name);
    
    // Navigate to create moment with user data
    setTimeout(() => {
      navigate(`/crea/momento?inviteUserId=${userId}&inviteUserName=${encodeURIComponent(user.name)}`);
    }, 500);
  }, [users, onInvite, navigate]);

  const resetStack = useCallback(() => {
    setCurrentIndex(0);
    setPassedUsers(new Set());
    setAnimatingCard(null);
  }, []);

  if (availableUsers.length === 0 || currentIndex >= availableUsers.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center px-6">
        <div className="bg-primary/10 rounded-full p-6 mb-6">
          <Users className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Hai visto tutti!
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Non ci sono più persone da scoprire in questo momento. Torna più tardi per nuovi profili!
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <Button onClick={resetStack} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Ricomincia
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/inviti')}
            className="w-full"
          >
            Torna agli Inviti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[500px] max-h-[calc(100vh-200px)] overflow-hidden">
      {/* Cards Stack */}
      <div className="relative h-full w-full">
        {displayUsers.map((user, index) => (
          <SwipeUserCard
            key={user.id}
            user={user}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            isTop={index === 0}
            className={animatingCard === user.id ? "animate-fade-out" : ""}
            style={{
              zIndex: displayUsers.length - index,
              scale: index === 0 ? 1 : 0.95 - (index * 0.05),
              opacity: index === 0 ? 1 : 0.8 - (index * 0.2),
            }}
          />
        ))}
      </div>

      {/* Progress Indicator - Mobile optimized */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-medium">
            {Math.min(currentIndex + 1, availableUsers.length)} / {availableUsers.length}
          </span>
        </div>
      </div>

      {/* Instructions - Mobile optimized */}
      {currentIndex === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none px-4">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 text-center animate-pulse max-w-xs">
            <p className="text-white text-xs font-medium">
              Scorri o tocca i pulsanti per decidere
            </p>
          </div>
        </div>
      )}

      {/* Bottom Actions - Mobile optimized */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inviti')}
          className="bg-white/90 backdrop-blur-sm border-white/30 text-xs px-3 py-1"
        >
          Torna alla Lista
        </Button>
      </div>
    </div>
  );
}