import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { MapPin, Heart, MessageCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import QuickInviteModal from "@/components/invites/QuickInviteModal";

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
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  // Transform user to NearbyUser format for the modal
  const nearbyUser = {
    user_id: user.id,
    name: user.name,
    username: user.name.toLowerCase().replace(/\s+/g, ''),
    avatar_url: user.avatar_url || '/placeholder.svg',
    mood: 'friendly',
    distance_km: user.distance_km || 0,
    availability_id: user.is_available ? 'available' : 'busy',
    job_title: '',
    interests: user.preferred_moments || []
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
      {/* Availability Badge - positioned at top right */}
      <div className="absolute top-3 right-3 z-10">
        <Badge 
          className={cn(
            "text-xs px-2 py-1.5 bg-brand-cream text-foreground border border-border/30 shadow-sm",
            user.is_available 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full mr-1.5",
            user.is_available ? "bg-green-500" : "bg-gray-400"
          )} />
          {getAvailabilityText()}
        </Badge>
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
        <h3 className="font-medium text-foreground text-left text-sm">
          {user.name}
          {user.age && (
            <span className="text-muted-foreground font-normal">, {user.age}</span>
          )}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">
            {user.city}
            {user.distance_km && (
              <span> • {user.distance_km.toFixed(1)} km</span>
            )}
          </span>
        </div>

        {/* Preferred Moments */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart className="h-3 w-3 flex-shrink-0 fill-current text-pink-500" />
          <span className="truncate">{getPreferredMomentsText()}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleInvite}
            className="flex-1 bg-background border border-border/30 hover:bg-secondary text-foreground font-medium h-8 text-xs"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Invita
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-border/50"
          >
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Quick Invite Modal */}
      <QuickInviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        targetUser={nearbyUser}
      />
    </Card>
  );
}
