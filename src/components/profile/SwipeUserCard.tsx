import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { X, Heart, MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
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
    
    setDragOffset({ x: 0, y: 0 });
  };

  const getRotation = () => {
    if (!isDragging) return 0;
    return (dragOffset.x / window.innerWidth) * 30; // Max 30 degrees rotation
  };

  const getOpacity = () => {
    if (!isDragging) return 1;
    return Math.max(0.5, 1 - (Math.abs(dragOffset.x) / 200));
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        "absolute inset-4 bg-background border-0 overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing",
        isDragging && "transition-none",
        !isDragging && "transition-all duration-300 ease-out",
        className
      )}
      style={{
        ...style,
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg)`,
        opacity: getOpacity(),
        zIndex: isTop ? 10 : style?.zIndex || 1,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <EnhancedImage
          src={user.avatar_url || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
          fallbackSrc="/placeholder.svg"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Swipe Indicators */}
      {isDragging && (
        <>
          <div
            className={cn(
              "absolute top-20 left-8 px-4 py-2 rounded-lg font-bold text-2xl border-4 transition-opacity",
              dragOffset.x > 50 ? "opacity-100" : "opacity-0",
              "bg-green-500 text-white border-green-400"
            )}
          >
            LIKE
          </div>
          <div
            className={cn(
              "absolute top-20 right-8 px-4 py-2 rounded-lg font-bold text-2xl border-4 transition-opacity",
              dragOffset.x < -50 ? "opacity-100" : "opacity-0",
              "bg-red-500 text-white border-red-400"
            )}
          >
            PASS
          </div>
        </>
      )}

      {/* Top Info */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
        <Badge
          className={cn(
            "bg-black/40 backdrop-blur-sm text-white border-white/20",
            user.is_available ? "text-green-300" : "text-gray-300"
          )}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              user.is_available ? "bg-green-400" : "bg-gray-400"
            )}
          />
          {user.is_available ? "Disponibile" : "Occupato"}
        </Badge>
        
        {user.distance_km && (
          <Badge className="bg-black/40 backdrop-blur-sm text-white border-white/20">
            <MapPin className="w-3 h-3 mr-1" />
            {user.distance_km.toFixed(1)} km
          </Badge>
        )}
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold">
              {user.name}
            </h2>
            {user.age && (
              <span className="text-2xl font-light opacity-90">{user.age}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm opacity-90">
            <MapPin className="w-4 h-4" />
            <span>{user.city}</span>
          </div>

          {user.preferred_moments && user.preferred_moments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.preferred_moments.slice(0, 3).map((moment, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {moment}
                </Badge>
              ))}
              {user.preferred_moments.length > 3 && (
                <Badge
                  variant="outline"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30"
                >
                  +{user.preferred_moments.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - Only show on top card when not dragging */}
      {isTop && !isDragging && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
          <Button
            size="lg"
            variant="outline"
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-white/30 hover:bg-white text-red-500 hover:text-red-600 shadow-lg"
            onClick={() => onSwipeLeft(user.id)}
          >
            <X className="w-6 h-6" />
          </Button>
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
            onClick={() => onSwipeRight(user.id)}
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      )}
    </Card>
  );
}