import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle, Share2, CreditCard, Navigation } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale/it";
import { useNavigate } from "react-router-dom";
import { ShareModal } from "@/components/shared/ShareModal";
import { EditDeleteMenu } from "@/components/shared/EditDeleteMenu";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { TicketPurchaseModal } from "@/components/tickets/TicketPurchaseModal";
import { getEventStatus } from "@/utils/eventStatus";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface MomentCardProps {
  id: string;
  title: string;
  description?: string;
  image?: string;
  category: string;
  time: string;
  place?: {
    lat: number;
    lng: number;
    name: string;
    address?: string;
  };
  organizer: {
    name: string;
    avatar?: string;
  };
  participants: number;
  participantIds?: string[];
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
  when_at?: string;
  end_at?: string;
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
  place,
  organizer,
  participants,
  participantIds,
  maxParticipants,
  reactions = {
    hearts: 0,
    likes: 0,
    stars: 0,
    fire: 0
  },
  mood,
  isOwner = false,
  hostId,
  hasVideo = false,
  videoUrl,
  paymentRequired = false,
  price = 0,
  currency = 'EUR',
  when_at,
  end_at
}: MomentCardProps) {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(getEventStatus(when_at, end_at));
  const videoRef = useRef<HTMLVideoElement>(null);
  const isCurrentUserOwner = user?.id === hostId;

  // Parse location info
  const locationInfo = useMemo(() => {
    if (!place?.address) return null;
    const addressParts = place.address.split(',').map(p => p.trim());
    return {
      street: addressParts[0] || '',
      city: addressParts[addressParts.length - 2] || '',
      province: addressParts[addressParts.length - 1] || ''
    };
  }, [place]);

  // Fetch participant avatars
  const [participantAvatars, setParticipantAvatars] = useState<Array<{
    id: string;
    avatar_url?: string;
    name: string;
  }>>([]);
  useEffect(() => {
    if (!participantIds || participantIds.length === 0) {
      setParticipantAvatars([]);
      return;
    }
    const fetchAvatars = async () => {
      const idsToFetch = participantIds.slice(0, 4);
      const {
        data
      } = await supabase.from('profiles').select('id, avatar_url, name').in('id', idsToFetch);
      if (data) {
        setParticipantAvatars(data);
      }
    };
    fetchAvatars();
  }, [participantIds]);

  // Update event status in real-time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = getEventStatus(when_at, end_at);
      setCurrentStatus(newStatus);
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, [when_at, end_at]);

  // Use current status for display
  const eventStatusInfo = currentStatus;
  const handleReaction = (reactionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

  // Video auto-play logic
  const {
    targetRef
  } = useIntersectionObserver({
    threshold: 0.6,
    onIntersect: entry => {
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
    navigate(`/moment/${id}`);
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
    return categories[cat.toLowerCase()] || '';
  };
  return <div ref={targetRef} className="w-full cursor-pointer transition-smooth group md:max-w-sm md:mx-auto snap-start" onClick={handleCardClick} data-snap-card>
      {/* Unified Responsive Layout */}
      <div className="w-full h-screen md:h-auto flex flex-col bg-background rounded-xl border border-border/30 md:border-0 md:shadow-card md:hover:shadow-elevated overflow-hidden">
        {/* Hero Image Section */}
        <div className="relative w-full h-[50vh] md:h-80 lg:h-96 overflow-hidden md:rounded-t-xl">
          {hasVideo && videoUrl ? <video ref={videoRef} src={videoUrl} className="w-full h-full object-cover" muted loop playsInline poster={image} /> : image ? <EnhancedImage src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-smooth" fallbackSrc="/placeholder.svg" skeletonClassName="w-full h-full" /> : <div className="w-full h-full bg-gradient-to-br from-brand-gray to-muted flex items-center justify-center">
              <span className="text-6xl opacity-60">{getCategoryEmoji(category)}</span>
            </div>}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

          {/* Event Status Badge - Bottom Left */}
          {eventStatusInfo && eventStatusInfo.status !== 'upcoming' && <div className="absolute bottom-4 left-4 z-20">
              <Badge className={`${eventStatusInfo.className} backdrop-blur-md px-3 py-1.5 text-xs font-medium shadow-card`}>
                <span className={`mr-1.5 ${eventStatusInfo.iconColor}`}>{eventStatusInfo.icon}</span>
                {eventStatusInfo.label}
              </Badge>
            </div>}

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
                {mood && <Badge variant="outline" className="bg-black/40 backdrop-blur-md border-white/20 text-white text-xs self-start">
                    {mood}
                  </Badge>}
              </div>
              
              {/* Right side - Menu */}
              <div className="flex items-center">
                {isCurrentUserOwner && <EditDeleteMenu contentType="moments" contentId={id} isOwner={isCurrentUserOwner} />}
              </div>
            </div>
          </div>

          {/* Reactions Overlay */}
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            {Object.entries(reactions).map(([type, count]) => {
            if (count === 0) return null;
            const Icon = reactionIcons[type as keyof typeof reactionIcons];
            const isActive = userReaction === type;
            return <button key={type} onClick={e => handleReaction(type, e)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-smooth ${isActive ? 'gradient-brand text-brand-black shadow-brand' : 'bg-white/95 backdrop-blur-md hover:bg-white border border-white/40 shadow-card'}`}>
                  <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''}`} strokeWidth={1.5} />
                  {count}
                </button>;
          })}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 md:flex-initial px-4 py-4 space-y-3 bg-background md:rounded-b-xl">
          {/* Title */}
          <h3 className="font-semibold text-lg md:text-xl leading-tight line-clamp-2">{title}</h3>
          
          {/* Compact Location & Date Cards */}
          <div className="flex gap-3">
            {/* Card Luogo */}
            <div 
              className="flex-1 rounded-2xl bg-muted/30 border border-border/20 p-3 cursor-pointer hover:bg-muted/50 transition-colors min-h-[80px]"
              onClick={(e) => {
                e.stopPropagation();
                if (place?.lat && place?.lng) {
                  window.open(`https://www.google.com/maps?q=${place.lat},${place.lng}`, '_blank');
                }
              }}
            >
              <div className="flex items-start gap-2 h-full">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold truncate">
                    {locationInfo?.province || locationInfo?.city || 'Provincia'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {locationInfo?.street || place?.name || 'Via non specificata'}
                  </p>
                </div>
                <Navigation className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </div>

            {/* Card Data/Ora */}
            <div className="flex-1 rounded-2xl bg-muted/30 border border-border/20 p-3 min-h-[80px]">
              <div className="flex items-start gap-2 h-full">
                <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold">
                    {when_at ? format(new Date(when_at), "EEE, dd.MM", { locale: it }) : time.split(' ')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {when_at ? format(new Date(when_at), "HH:mm") : time.split(' ').slice(1).join(' ')}
                    {end_at && ` - ${format(new Date(end_at), "HH:mm")}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            {participantAvatars.length > 0 && <div className="flex -space-x-2">
                {participantAvatars.map(participant => <Avatar key={participant.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={participant.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {participant.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>)}
              </div>}
            
            <div className="flex flex-col">
              <span className="text-sm">
                <span className="font-semibold">{participants}</span>
                {maxParticipants ? `/${maxParticipants}` : ''} partecipanti
              </span>
              {maxParticipants && participants < maxParticipants && <span className="text-xs text-muted-foreground">
                  {maxParticipants - participants} posti disponibili
                </span>}
            </div>
          </div>

          {/* Price Display */}
          {paymentRequired && price > 0 && <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Prezzo:</span>
              <span className="font-bold text-lg text-brand">
                {new Intl.NumberFormat('it-IT', {
              style: 'currency',
              currency: currency
            }).format(price / 100)}
              </span>
            </div>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button size={isMobile ? "default" : "sm"} variant={paymentRequired ? "default" : "default"} className={paymentRequired ? `flex-1 ${isMobile ? "h-12 text-base" : "h-9"} bg-gradient-to-r from-brand to-brand-accent hover:from-brand-accent hover:to-brand text-white font-medium shadow-md hover:shadow-lg transition-all duration-200` : `flex-1 ${isMobile ? "h-12 text-base" : "h-9"} bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200`} onClick={e => {
            e.stopPropagation();
            if (paymentRequired && price > 0) {
              setShowTicketModal(true);
            } else {
              handleCardClick();
            }
          }}>
              {paymentRequired && price > 0 ? <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Acquista Biglietto
                </> : 'Partecipa'}
            </Button>
            
            <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={async e => {
            e.stopPropagation();
            const shareUrl = `${window.location.origin}/moment/${id}`;
            if (navigator.share) {
              try {
                await navigator.share({
                  title: title,
                  text: `Guarda questo momento: ${title}`,
                  url: shareUrl
                });
              } catch (error) {
                console.error('Error sharing:', error);
              }
            } else {
              await navigator.clipboard.writeText(shareUrl);
              toast({
                title: "Link copiato!",
                description: "Il link è stato copiato negli appunti"
              });
            }
          }}>
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </Button>
            
            <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={e => {
            e.stopPropagation();
            navigate(`/chat/moment/${id}`);
          }}>
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Ticket Purchase Modal */}
      {paymentRequired && price > 0 && <TicketPurchaseModal open={showTicketModal} onOpenChange={setShowTicketModal} moment={{
      id,
      title,
      description,
      when_at: time,
      place: {
        name: place?.name || ''
      },
      price_cents: price * 100,
      // Convert to cents
      currency,
      livemoment_fee_percentage: 5,
      organizer_fee_percentage: 0,
      max_participants: maxParticipants,
      participant_count: participants
    }} />}
    </div>;
}