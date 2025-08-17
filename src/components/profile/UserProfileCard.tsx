import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PersonalityBadge } from "./PersonalityBadge";
import { MessageCircle, UserPlus, CheckCircle, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { EnhancedImage } from "@/components/ui/enhanced-image";

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  personality_type: string | null;
  job_title: string | null;
  mood: string | null;
  interests: string[] | null;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  instagram_username: string | null;
  chat_permission: string;
}

interface UserProfileCardProps {
  profile: UserProfile;
  isFollowing?: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  compact?: boolean;
}

export const UserProfileCard = ({ 
  profile, 
  isFollowing = false, 
  onFollow, 
  onMessage, 
  compact = false 
}: UserProfileCardProps) => {
  const canMessage = profile.chat_permission === 'everyone' || 
    (profile.chat_permission === 'followers_only' && isFollowing);

  return (
    <Card className="hover-scale">
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-start gap-4">
          <Link to={`/profilo/${profile.username}`} className="shrink-0">
            <Avatar className={compact ? "h-12 w-12" : "h-16 w-16"}>
              <EnhancedImage 
                src={profile.avatar_url || undefined} 
                alt={profile.name || profile.username || 'User'}
                className="w-full h-full object-cover rounded-full"
                fallbackSrc="/placeholder.svg"
              />
              <AvatarFallback className="bg-gradient-primary text-white font-medium">
                {profile.name?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to={`/profilo/${profile.username}`}
                className="story-link"
              >
                <h3 className="font-semibold text-foreground truncate">
                  {profile.name || profile.username}
                </h3>
              </Link>
              {profile.is_verified && (
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            
            {profile.job_title && (
              <p className="text-sm text-muted-foreground mb-2">
                {profile.job_title}
              </p>
            )}
            
            {!compact && profile.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {profile.bio}
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-3">
              {profile.personality_type && (
                <PersonalityBadge type={profile.personality_type} />
              )}
              {profile.mood && (
                <Badge variant="outline" className="text-xs">
                  {profile.mood}
                </Badge>
              )}
            </div>
            
            {!compact && profile.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {profile.interests.slice(0, 3).map((interest) => (
                  <Badge 
                    key={interest} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {interest}
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.interests.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{profile.followers_count} follower</span>
                <span>{profile.following_count} seguiti</span>
                {profile.instagram_username && (
                  <a 
                    href={`https://instagram.com/${profile.instagram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-600"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {canMessage && onMessage && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onMessage}
                    className="h-8"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Chat
                  </Button>
                )}
                {onFollow && (
                  <Button 
                    size="sm" 
                    variant={isFollowing ? "outline" : "default"}
                    onClick={onFollow}
                    className="h-8"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    {isFollowing ? 'Seguendo' : 'Segui'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};