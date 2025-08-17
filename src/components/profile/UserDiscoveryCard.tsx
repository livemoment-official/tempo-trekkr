import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    return user.is_available ? "Disponibile ora" : "Non disponibile";
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
      "p-4 bg-background/50 border border-border/50 hover:border-primary/30 transition-all duration-200 hover-scale",
      className
    )}>
      <div className="flex items-start gap-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <Avatar className="h-16 w-16 border-2 border-primary/10">
            <AvatarImage 
              src={user.avatar_url} 
              alt={user.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-medium text-foreground truncate pr-2">
                {user.name}
                {user.age && (
                  <span className="text-muted-foreground font-normal">, {user.age}</span>
                )}
              </h3>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {user.city}
                  {user.distance_km && (
                    <span> • {user.distance_km.toFixed(1)} km</span>
                  )}
                </span>
              </div>
            </div>

            {/* Invite Button */}
            <Button 
              size="sm" 
              onClick={handleInvite}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-8 text-sm font-medium rounded-full shrink-0"
            >
              Invita
            </Button>
          </div>

          {/* Availability Status */}
          <div className="mb-2">
            <Badge 
              variant={user.is_available ? "default" : "secondary"}
              className={cn(
                "text-xs px-2 py-1",
                user.is_available 
                  ? "bg-green-100 text-green-800 hover:bg-green-100" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-100"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full mr-1.5",
                user.is_available ? "bg-green-500" : "bg-gray-400"
              )} />
              {getAvailabilityText()}
            </Badge>
          </div>

          {/* Preferred Moments */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Heart className="h-3 w-3 fill-current text-pink-500" />
            <span className="truncate">{getPreferredMomentsText()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}