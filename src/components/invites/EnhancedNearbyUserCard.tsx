import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, MessageCircle, UserPlus, Clock, Heart } from "lucide-react";
import QuickInviteModal from "./QuickInviteModal";
import { useInviteCount } from "@/hooks/useNearbyUsers";

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

interface EnhancedNearbyUserCardProps {
  user: NearbyUser;
}

export default function EnhancedNearbyUserCard({ user }: EnhancedNearbyUserCardProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { data: inviteCount = 0 } = useInviteCount(user.user_id);
  
  const remainingInvites = Math.max(0, 3 - inviteCount);

  return (
    <>
      <Card className="group hover:shadow-md transition-all duration-200 border-muted/50 hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Large Avatar */}
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-muted/50 group-hover:ring-primary/20 transition-all">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10">
                  {user.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              {/* Availability indicator */}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">@{user.username}</p>
                  
                  {user.job_title && (
                    <p className="text-sm text-muted-foreground mb-2">{user.job_title}</p>
                  )}
                </div>

                {/* Distance Badge */}
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.distance_km.toFixed(1)}km
                </Badge>
              </div>

              {/* Mood */}
              {user.mood && (
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <Badge variant="secondary" className="text-xs">
                    {user.mood}
                  </Badge>
                </div>
              )}

              {/* Interests */}
              {user.interests && user.interests.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {user.interests.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {user.interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.interests.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Availability Status */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Disponibile ora</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  disabled={remainingInvites === 0}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Invita {remainingInvites > 0 && `(${remainingInvites})`}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              </div>
              
              {remainingInvites === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Limite inviti giornaliero raggiunto
                </p>
              )}
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