import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { X, Heart, MapPin, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
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
interface SwipeUserCardProps {
  user: SwipeUser;
  onSwipeLeft: (userId: string) => void;
  onSwipeRight: (userId: string) => void;
  style?: React.CSSProperties;
  className?: string;
  isTop?: boolean;
}
export function SwipeUserCard({
  user,
  onSwipeLeft,
  onSwipeRight,
  style,
  className,
  isTop = false
}: SwipeUserCardProps) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });
  const [startPos, setStartPos] = useState({
    x: 0,
    y: 0
  });
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({
      x: touch.clientX,
      y: touch.clientY
    });
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({
      x: deltaX,
      y: deltaY
    });
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({
      x: deltaX,
      y: deltaY
    });
  };
  const handleMouseUp = () => {
    handleDragEnd();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  const handleTouchEnd = () => {
    handleDragEnd();
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    const swipeThreshold = 100;
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      if (dragOffset.x > 0) {
        onSwipeRight(user.id);
      } else {
        onSwipeLeft(user.id);
      }
    }
    setDragOffset({
      x: 0,
      y: 0
    });
  };
  const getRotation = () => {
    if (!isDragging) return 0;
    return dragOffset.x / window.innerWidth * 30; // Max 30 degrees rotation
  };
  const getOpacity = () => {
    if (!isDragging) return 1;
    return Math.max(0.5, 1 - Math.abs(dragOffset.x) / 200);
  };
  return <Card ref={cardRef} className={cn("absolute overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing", isMobile ? "inset-2 border-0" : "inset-4 border-0", isDragging && "transition-none", !isDragging && "transition-all duration-300 ease-out", className)} style={{
    ...style,
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
    opacity: getOpacity(),
    zIndex: isTop ? 10 : style?.zIndex || 1
  }} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <EnhancedImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} className="w-full h-full object-cover" fallbackSrc="/placeholder.svg" />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Swipe Indicators - Updated terminology */}
      {isDragging && <>
          {/* Right Swipe Indicator (Invite) */}
          <div className={cn("absolute top-1/2 right-8 transform -translate-y-1/2 transition-all duration-200", dragOffset.x > 50 ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
            <div className="bg-green-500/90 backdrop-blur-sm px-5 py-3 rounded-full border-2 border-green-400 -rotate-12 shadow-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-lg">INVITA</span>
              </div>
            </div>
          </div>

          {/* Left Swipe Indicator (Skip) */}
          <div className={cn("absolute top-1/2 left-8 transform -translate-y-1/2 transition-all duration-200", dragOffset.x < -50 ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
            <div className="bg-red-500/90 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-red-400 rotate-12 shadow-lg">
              <span className="text-white font-bold text-lg">SALTA</span>
            </div>
          </div>
        </>}

      {/* Top Info */}
      <div className={cn("absolute left-4 right-4 flex justify-between items-start z-20", isMobile ? "top-4" : "top-6")}>
        <Badge className={cn("bg-black/40 backdrop-blur-sm text-white border-white/20", user.is_available ? "text-green-300" : "text-gray-300", isMobile ? "text-xs px-2 py-1" : "")}>
          <div className={cn("rounded-full mr-1.5", user.is_available ? "bg-green-400" : "bg-gray-400", isMobile ? "w-1.5 h-1.5" : "w-2 h-2")} />
          {user.is_available ? "Disponibile" : "Occupato"}
        </Badge>
        
        {user.distance_km && <Badge className={cn("bg-black/40 backdrop-blur-sm text-white border-white/20", isMobile ? "text-xs px-2 py-1" : "")}>
            <MapPin className={cn(isMobile ? "w-2.5 h-2.5 mr-1" : "w-3 h-3 mr-1")} />
            {user.distance_km.toFixed(1)} km
          </Badge>}
      </div>

      {/* Enhanced Bottom Info - More compact for mobile */}
      

      {/* Action Buttons for Mobile - Fixed dimensions */}
      {isMobile && isTop && !isDragging && <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
          <button onClick={() => onSwipeLeft(user.id)} className="w-16 h-16 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-red-400 shadow-lg hover:scale-110 active:scale-95 transition-transform">
            <div className="text-center">
              <div className="text-xl font-bold">✕</div>
            </div>
          </button>
          <button onClick={() => onSwipeRight(user.id)} className="w-16 h-16 bg-green-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-green-400 shadow-lg hover:scale-110 active:scale-95 transition-transform">
            <div className="text-center">
              <Calendar className="w-5 h-5" />
            </div>
          </button>
        </div>}

      {/* Desktop Action Buttons */}
      {!isMobile && isTop && !isDragging && <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
          <Button size="lg" variant="outline" className="rounded-full bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white text-red-500 hover:text-red-600 shadow-lg w-16 h-16" onClick={() => onSwipeLeft(user.id)}>
            <X className="w-6 h-6" />
          </Button>
          <Button size="lg" className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg w-16 h-16" onClick={() => onSwipeRight(user.id)}>
            <Calendar className="w-6 h-6" />
          </Button>
        </div>}
    </Card>;
}