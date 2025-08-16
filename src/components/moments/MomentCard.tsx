import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShareModal } from "@/components/shared/ShareModal";
import { EditDeleteMenu } from "@/components/shared/EditDeleteMenu";
import { useAuth } from "@/contexts/AuthContext";

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
  hostId
}: MomentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  const isCurrentUserOwner = user?.id === hostId;

  const handleReaction = (reactionType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserReaction(userReaction === reactionType ? null : reactionType);
  };

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
    <Card 
      className="w-full max-w-sm mx-auto cursor-pointer transition-smooth hover:shadow-elevated group"
      onClick={handleCardClick}
    >
      {/* Hero Image - 1080x1440 ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-gray to-muted flex items-center justify-center">
            <span className="text-6xl opacity-60">{getCategoryEmoji(category)}</span>
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          variant="minimal" 
          className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border-white/40"
        >
          {getCategoryEmoji(category)} {category}
        </Badge>

        {/* Edit/Delete Menu for Owner */}
        {isCurrentUserOwner && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <EditDeleteMenu
              contentType="moments"
              contentId={id}
              isOwner={isCurrentUserOwner}
            />
          </div>
        )}

        {/* Mood Badge */}
        {mood && (
          <Badge 
            variant="outline" 
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border-white/40"
          >
            {mood}
          </Badge>
        )}

        {/* Reactions Overlay */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {Object.entries(reactions).map(([type, count]) => {
            if (count === 0) return null;
            const Icon = reactionIcons[type as keyof typeof reactionIcons];
            const isActive = userReaction === type;
            return (
              <button
                key={type}
                onClick={(e) => handleReaction(type, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-smooth ${
                  isActive 
                    ? 'gradient-brand text-brand-black shadow-brand' 
                    : 'bg-white/95 backdrop-blur-md hover:bg-white border border-white/40 shadow-card'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'fill-current' : ''}`} strokeWidth={1.5} />
                {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Below Image */}
      <CardContent className="p-6 space-y-4">
        {/* Title */}
        <h3 className="font-medium text-lg leading-tight line-clamp-2">{title}</h3>
        
        {/* Time & Location */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" strokeWidth={1.5} />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar className="h-9 w-9 ring-2 ring-border/20">
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback className="text-xs font-medium">{organizer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{organizer.name}</p>
            <p className="text-xs text-muted-foreground">Organizzatore</p>
          </div>
        </div>

        {/* Participants & Actions */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.5} />
            <span>
              <span className="font-medium">{participants}</span>{maxParticipants ? `/${maxParticipants}` : ''} partecipanti
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ShareModal contentType="moment" contentId={id} title={title}>
              <Button size="xs" variant="ghost">
                <Share2 className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </ShareModal>
            
            <Button
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                // Open chat with organizer
              }}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline"
          className="w-full mt-4" 
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          Scopri di più
        </Button>
      </CardContent>
    </Card>
  );
}