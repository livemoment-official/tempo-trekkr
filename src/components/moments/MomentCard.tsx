import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareModal } from "@/components/shared/ShareModal";
import { EditDeleteMenu } from "@/components/shared/EditDeleteMenu";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface MomentCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category: string;
  time: string;
  location: string;
  organizer: {
    name: string;
    avatar?: string;
  };
  participants: number;
  maxParticipants?: number;
  reactions?: {
    hearts: number;
    likes: number;
    stars: number;
    fire: number;
  };
  mood?: string;
  distance?: number;
  onJoin?: () => void;
  onLeave?: () => void;
  tags?: string[];
  isOwner?: boolean;
  hostId?: string;
  hasVideo?: boolean;
  videoUrl?: string;
}

const reactionIcons = {
  hearts: Heart,
  likes: ThumbsUp,
  stars: Star,
  fire: Flame
};

export function MomentCard({ 
  id, 
  title, 
  description, 
  image, 
  category, 
  time, 
  location, 
  organizer, 
  participants, 
  maxParticipants,
  reactions = { hearts: 0, likes: 0, stars: 0, fire: 0 },
  mood,
  isOwner = false,
  hostId,
  hasVideo = false,
  videoUrl
}: MomentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isCurrentUserOwner = user?.id === hostId;

  const handleReaction = (reactionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  // Video auto-play logic for mobile
  const { targetRef } = useIntersectionObserver({
    threshold: 0.6,
    onIntersect: (entry) => {
      if (!hasVideo || !videoRef.current) return;
      
      if (entry.isIntersecting) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    },
    enabled: hasVideo && isMobile
  });

  const handleCardClick = () => {
    navigate(`/momenti/${id}`);
  };

  const getCategoryEmoji = (cat: string) => {
    const categories: Record<string, string> = {
      'calcio': '⚽',
      'aperitivo': '🍺',
      'feste': '🎉',
      'casa': '🏠',
      'sport': '🏃',
      'musica': '🎵',
      'arte': '🎨',
      'cibo': '🍕',
      'natura': '🌿'
    };
    return categories[cat.toLowerCase()] || '✨';
  };

  return (
    <div 
      ref={targetRef}
      className={`w-full ${isMobile ? 'h-screen snap-start' : 'max-w-sm mx-auto'} cursor-pointer transition-smooth group`}
      onClick={handleCardClick}
      data-snap-card
    >
      {/* Unified Card Layout */}
      <Card className="w-full h-full flex flex-col overflow-hidden shadow-elevated hover:shadow-elevated group-hover:shadow-xl transition-all duration-300">
        {/* Hero Image Section */}
        <div className={`relative w-full ${isMobile ? 'flex-1' : 'aspect-[4/5]'} overflow-hidden`}>
          {hasVideo && videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              poster={image}
            />
          ) : image ? (
            <EnhancedImage 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-500"
              fallbackSrc="/placeholder.svg"
              skeletonClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-6xl opacity-60">{getCategoryEmoji(category)}</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* Top Section - Organizer */}
          <div className="absolute top-4 left-4 right-4 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-3 py-2 border border-white/40 shadow-card">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={organizer.avatar} />
                  <AvatarFallback className="text-xs font-medium">{organizer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{organizer.name}</span>
              </div>
              
              {/* Menu for owner */}
              {isCurrentUserOwner && (
                <EditDeleteMenu
                  contentType="moments"
                  contentId={id}
                  isOwner={isCurrentUserOwner}
                />
              )}
            </div>
          </div>

          {/* Reactions Overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            {Object.entries(reactions).map(([type, count]) => {
              if (count === 0) return null;
              const Icon = reactionIcons[type as keyof typeof reactionIcons];
              const isActive = userReaction === type;
              return (
                <button
                  key={type}
                  onClick={(e) => handleReaction(type, e)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-smooth hover-scale ${
                    isActive 
                      ? 'gradient-brand text-brand-black shadow-brand' 
                      : 'bg-white/90 backdrop-blur-md hover:bg-white border border-white/40 shadow-card'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'fill-current' : ''}`} strokeWidth={1.5} />
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className={`flex flex-col ${isMobile ? 'h-auto min-h-[140px]' : 'flex-1'} p-4 space-y-3 bg-background`}>
          {/* Title */}
          <h3 className="font-semibold text-xl leading-tight line-clamp-2 text-foreground">{title}</h3>
          
          {/* Time & Location */}
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm font-medium">{time}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm truncate">{location}</span>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm">
              <span className="font-semibold text-foreground">{participants}</span>
              {maxParticipants ? `/${maxParticipants}` : ''} partecipanti
            </span>
          </div>

          {/* Action Button - Prominent like in reference */}
          <Button 
            size="lg"
            className="w-full mt-auto bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Partecipa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}