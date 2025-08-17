import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
  city: string;
  is_available: boolean;
  preferred_moments: string[];
  age?: number;
  distance_km?: number;
}

interface UserProfileCardProps {
  user: UserProfile;
  onInvite?: (userId: string) => void;
  className?: string;
}

export function UserDiscoveryCard({ user, onInvite, className }: UserProfileCardProps) {
  const handleInvite = () => {
    onInvite?.(user.id);
  };

  const getAvailabilityText = () => {
    return user.is_available ? "Disponibile" : "Non disponibile";
  };

  const getPreferredMomentsText = () => {
    if (!user.preferred_moments || user.preferred_moments.length === 0) {
      return "Nessun momento preferito";
    }
    
    if (user.preferred_moments.length === 1) {
      return user.preferred_moments[0];
    }
    
    if (user.preferred_moments.length === 2) {
      return user.preferred_moments.join(", ");
    }
    
    return `${user.preferred_moments.slice(0, 2).join(", ")} +${user.preferred_moments.length - 2}`;
  };

  return (
    <Card className={cn(
      "relative bg-background border border-border/50 hover:border-primary/30 transition-all duration-200 hover-scale overflow-hidden",
      className
    )}>
      {/* Header with badges and button */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        {/* Availability Badge */}
        <Badge 
          className={cn(
            "text-xs px-2 py-1.5 bg-white border-0 shadow-sm",
            user.is_available 
              ? "text-green-700" 
              : "text-gray-600"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full mr-1.5",
            user.is_available ? "bg-green-500" : "bg-gray-400"
          )} />
          {getAvailabilityText()}
        </Badge>

        {/* Invite Button */}
        <Button 
          size="sm" 
          onClick={handleInvite}
          className="bg-orange-500 hover:bg-orange-600 text-white px-3 h-7 text-xs font-medium rounded-full border-0 shadow-sm"
        >
          Invita
        </Button>
      </div>

      {/* Profile Image */}
      <div className="aspect-[4/3] relative">
        <EnhancedImage 
          src={user.avatar_url || "/placeholder.svg"} 
          alt={user.name}
          className="w-full h-full object-cover"
          fallbackSrc="/placeholder.svg"
        />
      </div>

      {/* User Info */}
      <div className="p-3 space-y-1">
        {/* Name */}
        <h3 className="font-medium text-foreground text-center text-sm">
          {user.name}
          {user.age && (
            <span className="text-muted-foreground font-normal">, {user.age}</span>
          )}
        </h3>
        
        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {user.city}
            {user.distance_km && (
              <span> • {user.distance_km.toFixed(1)} km</span>
            )}
          </span>
        </div>

        {/* Preferred Moments */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Heart className="h-3 w-3 fill-current text-pink-500" />
          <span className="truncate text-center">{getPreferredMomentsText()}</span>
        </div>
      </div>
    </Card>
  );
}