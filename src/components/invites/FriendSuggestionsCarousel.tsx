import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { MapPin, Heart, MessageCircle, UserPlus, Clock, Star, Zap } from "lucide-react";
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
  compatibility_score?: number;
  is_new?: boolean;
  is_popular?: boolean;
  is_online?: boolean;
  last_seen?: string;
}

interface FriendSuggestionsCarouselProps {
  title: string;
  icon?: React.ReactNode;
  users: UserProfile[];
  onInvite?: (userId: string) => void;
  className?: string;
}

interface EnhancedUserCardProps {
  user: UserProfile;
  onInvite?: (userId: string) => void;
  showCompatibility?: boolean;
}

function EnhancedUserCard({ user, onInvite, showCompatibility = false }: EnhancedUserCardProps) {
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
    if (user.is_online) return "Online ora";
    if (user.is_available) return "Disponibile";
    return user.last_seen || "Non disponibile";
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

  const getBadges = () => {
    const badges = [];
    if (user.is_new) badges.push({ text: "Nuovo", color: "bg-blue-500", icon: Zap });
    if (user.is_popular) badges.push({ text: "Popolare", color: "bg-orange-500", icon: Star });
    if (user.is_online) badges.push({ text: "Online", color: "bg-green-500", icon: Clock });
    return badges;
  };

  return (
    <Card className="relative bg-background border border-border/50 hover:border-primary/30 transition-all duration-200 hover-scale overflow-hidden w-full">
      {/* Status and Special Badges */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {getBadges().slice(0, 2).map((badge, index) => {
          const IconComponent = badge.icon;
          return (
            <Badge 
              key={index}
              className={cn(
                "text-xs px-2 py-1 text-white border-0 shadow-sm",
                badge.color
              )}
            >
              <IconComponent className="w-2 h-2 mr-1" />
              {badge.text}
            </Badge>
          );
        })}
      </div>

      {/* Compatibility Score */}
      {showCompatibility && user.compatibility_score && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 shadow-sm">
            {user.compatibility_score}% match
          </Badge>
        </div>
      )}

      {/* Profile Image */}
      <div className="aspect-[3/2] relative">
        <EnhancedImage 
          src={user.avatar_url || "/placeholder.svg"} 
          alt={user.name}
          className="w-full h-full object-cover"
          fallbackSrc="/placeholder.svg"
        />
      </div>

      {/* User Info */}
      <div className="p-4 space-y-2">
        {/* Name and Age */}
        <h3 className="font-semibold text-foreground text-left">
          {user.name}
          {user.age && (
            <span className="text-muted-foreground font-normal">, {user.age}</span>
          )}
        </h3>
        
        {/* Location and Distance */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">
            {user.city}
            {user.distance_km && (
              <span> • {user.distance_km.toFixed(1)} km</span>
            )}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 text-sm">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            user.is_online ? "bg-green-500" : user.is_available ? "bg-yellow-500" : "bg-gray-400"
          )} />
          <span className={cn(
            "text-sm",
            user.is_online ? "text-green-600 font-medium" : "text-muted-foreground"
          )}>
            {getAvailabilityText()}
          </span>
        </div>

        {/* Preferred Moments */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Heart className="h-3.5 w-3.5 flex-shrink-0 fill-current text-pink-500" />
          <span className="truncate">{getPreferredMomentsText()}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleInvite}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 text-sm font-medium"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Invita
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 border-border/50"
          >
            <UserPlus className="h-4 w-4" />
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

export function FriendSuggestionsCarousel({ 
  title, 
  icon, 
  users, 
  onInvite, 
  className,
}: FriendSuggestionsCarouselProps) {
  if (users.length === 0) return null;

  const showCompatibility = title.includes("Simili");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{users.length} suggerimenti</p>
        </div>
      </div>

      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {users.map((user) => (
            <CarouselItem key={user.id} className="pl-3 basis-[85%] sm:basis-[45%] lg:basis-[33%]">
              <EnhancedUserCard 
                user={user} 
                onInvite={onInvite}
                showCompatibility={showCompatibility}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-3" />
        <CarouselNext className="-right-3" />
      </Carousel>
    </div>
  );
}