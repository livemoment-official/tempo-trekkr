import { Button } from "@/components/ui/button";
import { EnhancedImage } from "@/components/ui/enhanced-image";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, UserPlus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
interface UserProfile {
  id: string;
  name: string;
  avatar_url: string;
  city: string;
  age: number;
  distance_km?: number;
  is_available: boolean;
  preferred_moments?: string[];
}
interface UserListItemProps {
  user: UserProfile;
  onFollow?: (userId: string) => void;
  onInvite?: (userId: string, userName: string) => void;
  className?: string;
}
export function UserListItem({
  user,
  onFollow,
  onInvite,
  className
}: UserListItemProps) {
  const navigate = useNavigate();

  const handleFollow = () => {
    onFollow?.(user.id);
  };

  const handleInvite = () => {
    onInvite?.(user.id, user.name);
  };

  const handleProfileClick = () => {
    navigate(`/user/${user.id}`);
  };

  // Simulate shared friends count
  const sharedFriends = Math.floor(Math.random() * 15) + 1;
  const totalFriends = Math.floor(Math.random() * 500) + 100;
  const totalMoments = Math.floor(Math.random() * 50) + 5;
  return <div className={cn("flex items-center gap-4 p-4 bg-background rounded-xl border border-border/50 hover:shadow-sm transition-all duration-200 cursor-pointer", className)} onClick={handleProfileClick}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <EnhancedImage src={user.avatar_url} alt={`${user.name} avatar`} className="w-14 h-14 rounded-full object-cover" fallbackSrc="/placeholder.svg" />
        {user.is_available && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">
            {user.name}
          </h3>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {user.age}
          </Badge>
          {user.distance_km && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{user.distance_km < 1 ? `${Math.round(user.distance_km * 1000)}m` : `${user.distance_km.toFixed(1)}km`}</span>
            </div>
          )}
        </div>
        
        {user.preferred_moments && user.preferred_moments.length > 0 && (
          <p className="text-xs text-muted-foreground mb-1 truncate">
            {user.preferred_moments.slice(0, 2).join(", ")}
          </p>
        )}

        <div className="space-y-1">
          <p className="text-xs text-orange-500 font-medium">
            {sharedFriends} amici in comune
          </p>
          <p className="text-xs text-muted-foreground">
            {totalFriends} Amici • {totalMoments} Momenti
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {onInvite && (
          <Button onClick={handleInvite} size="sm" variant="outline" className="h-8 w-8 p-0 border-border/50" title="Invita">
            <Send className="h-3 w-3" />
          </Button>
        )}
        <Button onClick={handleFollow} size="sm" variant="outline" className="h-8 w-8 p-0 border-border/50" title="Aggiungi amico">
          <UserPlus className="h-3 w-3" />
        </Button>
      </div>
    </div>;
}