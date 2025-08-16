import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, UserPlus, MessageCircle } from "lucide-react";
import { useInviteCount } from "@/hooks/useNearbyUsers";
import QuickInviteModal from "./QuickInviteModal";

interface NearbyUser {
  user_id: string;
  name: string;
  username: string;
  avatar_url: string;
  mood: string;
  distance_km: number;
  availability_id: string;
  job_title: string;
  interests: string[];
}

interface NearbyUserCardProps {
  user: NearbyUser;
}

export default function NearbyUserCard({ user }: NearbyUserCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { data: inviteCount = 0 } = useInviteCount(user.user_id);
  
  const canInvite = inviteCount < 3;
  const remainingInvites = 3 - inviteCount;

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} alt={user.name} />
              <AvatarFallback>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-sm truncate">{user.name}</h3>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {formatDistance(user.distance_km)}
                </div>
              </div>

              {user.job_title && (
                <p className="text-xs text-muted-foreground mt-1">{user.job_title}</p>
              )}

              {user.mood && (
                <Badge variant="outline" className="text-xs mt-2">
                  {user.mood}
                </Badge>
              )}

              <div className="flex items-center gap-1 mt-2">
                <Clock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Disponibile ora</span>
              </div>

              {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.interests.slice(0, 2).map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {user.interests.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{user.interests.length - 2}
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant={canInvite ? "default" : "secondary"}
                  disabled={!canInvite}
                  onClick={() => setShowInviteModal(true)}
                  className="flex-1"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  {canInvite ? `Invita (${remainingInvites})` : 'Limite raggiunto'}
                </Button>
                
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickInviteModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        targetUser={user}
      />
    </>
  );
}