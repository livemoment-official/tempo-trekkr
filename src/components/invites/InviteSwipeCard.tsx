import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, Clock, User, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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

interface InviteSwipeCardProps {
  invite: SwipeInvite;
  onSwipeLeft: (inviteId: string) => void;
  onSwipeRight: (inviteId: string) => void;
  isTop: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function InviteSwipeCard({ 
  invite, 
  onSwipeLeft, 
  onSwipeRight, 
  isTop, 
  className = "",
  style = {} 
}: InviteSwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse/Touch handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    setStartPos({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !isTop) return;
    const deltaX = clientX - startPos.x;
    const deltaY = clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging || !isTop) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipeRight(invite.id);
      } else {
        onSwipeLeft(invite.id);
      }
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Visual feedback functions
  const getRotation = () => {
    const maxRotation = 15;
    const rotation = (dragOffset.x / 300) * maxRotation;
    return Math.max(-maxRotation, Math.min(maxRotation, rotation));
  };

  const getOpacity = () => {
    if (!isTop) return style.opacity || 0.8;
    const fadeThreshold = 150;
    const opacity = 1 - Math.abs(dragOffset.x) / fadeThreshold;
    return Math.max(0.3, Math.min(1, opacity));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accettato';
      case 'rejected':
        return 'Rifiutato';
      default:
        return 'In attesa';
    }
  };

  return (
    <div 
      className={`absolute inset-4 ${className}`}
      style={{
        ...style,
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${getRotation()}deg) scale(${style.scale || 1})`,
        opacity: getOpacity(),
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Card 
        ref={cardRef}
        className={`h-full w-full cursor-grab active:cursor-grabbing shadow-xl border-2 touch-optimized swipe-card ${
          isTop ? 'hover:shadow-2xl card-interactive' : ''
        } ${isDragging ? 'shadow-2xl' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          touchAction: 'none',
          userSelect: 'none'
        }}
      >
        <CardContent className="p-4 sm:p-6 h-full flex flex-col mobile-scroll">
          {/* Status Badge */}
          <Badge className={`self-end mb-4 ${getStatusColor(invite.status)} text-xs font-medium`}>
            {getStatusText(invite.status)}
          </Badge>

          {/* Header with sender info */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16 ring-2 ring-primary/10">
              <AvatarImage src={invite.sender?.avatar_url} alt={invite.sender?.name} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                {invite.sender?.name} ti ha invitato a
              </p>
              <h3 className="font-bold text-2xl text-foreground leading-tight">
                {invite.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          {invite.description && (
            <div className="mb-6">
              <p className="text-muted-foreground leading-relaxed">
                {invite.description}
              </p>
            </div>
          )}

          {/* Event details grid */}
          <div className="grid grid-cols-1 gap-4 mb-6 flex-1">
            {invite.when_at && (
              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Data</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(invite.when_at), "EEEE dd MMMM yyyy", { locale: it })}
                  </p>
                </div>
              </div>
            )}

            {invite.place?.name && (
              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">Luogo</p>
                  <p className="text-sm text-muted-foreground">{invite.place.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
              <Users className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Partecipanti</p>
                <p className="text-sm text-muted-foreground">
                  {invite.participants?.length || 0} persona{(invite.participants?.length || 0) !== 1 ? 'e' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Drag indicators */}
          {isTop && isDragging && (
            <>
              {/* Reject indicator (left) */}
              <div className={`absolute top-8 left-8 p-4 bg-red-500/90 rounded-full transition-opacity ${
                dragOffset.x < -50 ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
              }`}>
                <X className="h-8 w-8 text-white" />
              </div>
              
              {/* Accept indicator (right) */}
              <div className={`absolute top-8 right-8 p-4 bg-green-500/90 rounded-full transition-opacity ${
                dragOffset.x > 50 ? 'opacity-100 scale-110' : 'opacity-50 scale-100'
              }`}>
                <Check className="h-8 w-8 text-white" />
              </div>
            </>
          )}

          {/* Action buttons for accessibility - Mobile optimized */}
          <div className="flex gap-3 sm:hidden justify-center mt-auto pt-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSwipeLeft(invite.id)}
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-red-200 text-red-600 hover:bg-red-50 shadow-lg touch-target"
            >
              <X className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onSwipeRight(invite.id)}
              className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border-green-200 text-green-600 hover:bg-green-50 shadow-lg touch-target"
            >
              <Check className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}