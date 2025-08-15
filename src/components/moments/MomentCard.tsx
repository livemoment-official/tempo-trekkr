import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Heart, ThumbsUp, Star, Flame, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  mood
}: MomentCardProps) {
  const navigate = useNavigate();
  const [userReaction, setUserReaction] = useState<string | null>(null);

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
      className="w-full max-w-sm mx-auto cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* Hero Image - 1080x1440 ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-6xl">{getCategoryEmoji(category)}</span>
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
        >
          {getCategoryEmoji(category)} {category}
        </Badge>

        {/* Mood Badge */}
        {mood && (
          <Badge 
            variant="outline" 
            className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
          >
            {mood}
          </Badge>
        )}

        {/* Reactions Overlay */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          {Object.entries(reactions).map(([type, count]) => {
            const Icon = reactionIcons[type as keyof typeof reactionIcons];
            return (
              <Button
                key={type}
                size="sm"
                variant={userReaction === type ? "default" : "secondary"}
                className="h-8 px-2 bg-background/90 backdrop-blur-sm hover:bg-background"
                onClick={(e) => handleReaction(type, e)}
              >
                <Icon className="h-3 w-3 mr-1" />
                <span className="text-xs">{count}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content Below Image */}
      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{title}</h3>
        
        {/* Time & Location */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={organizer.avatar} />
            <AvatarFallback>{organizer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{organizer.name}</p>
            <p className="text-xs text-muted-foreground">Organizzatore</p>
          </div>
        </div>

        {/* Participants & Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {participants}{maxParticipants ? `/${maxParticipants}` : ''} partecipanti
            </span>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              // Open chat with organizer
            }}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full" 
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