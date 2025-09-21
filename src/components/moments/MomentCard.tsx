import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle, Share2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareModal } from "@/components/shared/ShareModal";
import { EditDeleteMenu } from "@/components/shared/EditDeleteMenu";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { TicketPurchaseModal } from "@/components/tickets/TicketPurchaseModal";

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
  paymentRequired?: boolean;
  price?: number;
  currency?: string;
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
  videoUrl,
  paymentRequired = false,
  price = 0,
  currency = 'EUR'
}: MomentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isCurrentUserOwner = user?.id === hostId;

  const handleReaction = (reactionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  // Video auto-play logic
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
    navigate(`/moment-detail/${id}`);
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
      className="w-full cursor-pointer transition-smooth group md:max-w-sm md:mx-auto snap-start"
      onClick={handleCardClick}
      data-snap-card
    >
      {/* Unified Responsive Layout */}
      <div className="w-full h-screen md:h-auto flex flex-col bg-background rounded-xl md:shadow-card md:hover:shadow-elevated overflow-hidden">
        {/* Hero Image Section */}
        <div className="relative w-full h-[65vh] md:h-80 lg:h-96 overflow-hidden md:rounded-t-xl">
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
              className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
              fallbackSrc="/placeholder.svg"
              skeletonClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-gray to-muted flex items-center justify-center">
              <span className="text-6xl opacity-60">{getCategoryEmoji(category)}</span>
            </div>
          )}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />

          {/* Top Section */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex items-start justify-between">
              {/* Left side - Organizer and Mood */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={organizer.avatar} />
                    <AvatarFallback className="text-xs text-white">{organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-white drop-shadow-lg">{organizer.name}</span>
                </div>
                {mood && (
                  <Badge 
                    variant="outline" 
                    className="bg-black/40 backdrop-blur-md border-white/20 text-white text-xs self-start"
                  >
                    {mood}
                  </Badge>
                )}
              </div>
              
              {/* Right side - Menu */}
              <div className="flex items-center">
                {isCurrentUserOwner && (
                  <EditDeleteMenu
                    contentType="moments"
                    contentId={id}
                    isOwner={isCurrentUserOwner}
                  />
                )}
              </div>
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
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-smooth ${
                    isActive 
                      ? 'gradient-brand text-brand-black shadow-brand' 
                      : 'bg-white/95 backdrop-blur-md hover:bg-white border border-white/40 shadow-card'
                  }`}
                >
                  <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''}`} strokeWidth={1.5} />
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 md:flex-initial px-4 py-4 space-y-3 bg-background md:rounded-b-xl">
          {/* Title */}
          <h3 className="font-semibold text-lg md:text-xl leading-tight line-clamp-2">{title}</h3>
          
          {/* Time & Location */}
          <div className="flex items-center gap-4 text-muted-foreground flex-wrap md:flex-col md:items-start md:gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-sm">{time}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-initial">
              <MapPin className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm truncate">{location}</span>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span className="text-sm">
              <span className="font-medium">{participants}</span>{maxParticipants ? `/${maxParticipants}` : ''} partecipanti
            </span>
          </div>

          {/* Price Display */}
          {paymentRequired && price > 0 && (
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Prezzo:</span>
              <span className="font-bold text-lg text-brand">
                {new Intl.NumberFormat('it-IT', {
                  style: 'currency',
                  currency: currency
                }).format(price / 100)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              size="sm"
              variant={paymentRequired ? "default" : "default"}
              className={paymentRequired 
                ? "flex-1 bg-gradient-to-r from-brand to-brand-accent hover:from-brand-accent hover:to-brand text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                : "flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              }
              onClick={(e) => {
                e.stopPropagation();
                if (paymentRequired && price > 0) {
                  setShowTicketModal(true);
                } else {
                  handleCardClick();
                }
              }}
            >
              {paymentRequired && price > 0 ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Acquista Biglietto
                </>
              ) : (
                'Partecipa'
              )}
            </Button>
            
            <ShareModal contentType="moment" contentId={id} title={title}>
              <Button size="sm" variant="outline" className="h-9 w-9 p-0">
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </ShareModal>
            
            <Button
              size="sm"
              variant="outline"
              className="h-9 w-9 p-0"
              onClick={(e) => {
                e.stopPropagation();
                // Open chat with organizer
              }}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      {paymentRequired && price > 0 && (
        <TicketPurchaseModal
          open={showTicketModal}
          onOpenChange={setShowTicketModal}
          moment={{
            id,
            title,
            description,
            when_at: time,
            place: { name: location },
            price_cents: price * 100, // Convert to cents
            currency,
            livemoment_fee_percentage: 5,
            organizer_fee_percentage: 0,
            max_participants: maxParticipants,
            participant_count: participants
          }}
        />
      )}
    </div>
  );
}