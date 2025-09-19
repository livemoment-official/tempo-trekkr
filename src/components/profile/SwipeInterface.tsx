import React, { useState, useCallback } from 'react';
import { SwipeUserCard } from './SwipeUserCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Users, Heart, Search, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}
export function SwipeInterface({
  users,
  onInvite,
  onPass,
  searchQuery = "",
  onSearchChange
}: SwipeInterfaceProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    return <div className="flex flex-col items-center justify-center h-full min-h-[600px] text-center px-6">
        <div className="bg-primary/10 rounded-full p-6 mb-6">
          <Calendar className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {passedUsers.size > 0 ? "Hai invitato tutti!" : "Nessuno da invitare"}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {passedUsers.size > 0 
            ? "Hai guardato tutte le persone disponibili per eventi. Perfetto!"
            : "Non ci sono persone disponibili per eventi nella tua zona al momento."
          }
        </p>
        <div className="space-y-3 w-full max-w-xs">
          {passedUsers.size > 0 && (
            <Button onClick={resetStack} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rivedi Persone
            </Button>
          )}
          <Button onClick={() => navigate('/trova-amici')} className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Trova Altri Amici
          </Button>
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 <strong>Suggerimento:</strong> Invitare qualcuno ti porterà direttamente alla creazione di un nuovo evento insieme!
          </p>
        </div>
      </div>;
  }
  return <div className="relative h-full min-h-[600px] max-h-[calc(100vh-200px)] overflow-hidden">
      {/* Simplified Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-4 pb-6">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="text-white text-base font-semibold">Invita Nuovi Amici</h2>
        </div>
      </div>

      {/* Mobile Search Bar - Repositioned */}
      {isMobile && onSearchChange && (
        <div className="absolute top-14 left-4 right-4 z-40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cerca persone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/90 backdrop-blur-sm border-white/20 text-sm"
            />
          </div>
        </div>
      )}

      {/* Progress Indicator - Smaller and repositioned */}
      <div className="absolute top-20 right-4 z-30">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-medium">
            {Math.min(currentIndex + 1, availableUsers.length)}/{availableUsers.length}
          </span>
        </div>
      </div>

      {/* Cards Stack - More space */}
      <div className="relative h-full w-full pt-16">
        {displayUsers.map((user, index) => <SwipeUserCard key={user.id} user={user} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight} isTop={index === 0} className={animatingCard === user.id ? "animate-fade-out" : ""} style={{
        zIndex: displayUsers.length - index,
        scale: index === 0 ? 1 : 0.95 - index * 0.03,
        opacity: index === 0 ? 1 : 0.7 - index * 0.2
      }} />)}
      </div>

      {/* Achievement Badge */}
      {passedUsers.size > 2 && (
        <div className="absolute top-36 right-4 z-40">
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-400/30">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">
                {passedUsers.size} persone viste!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>;
}