import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, UserPlus, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface RecommendationCardProps {
  recommendation: {
    id: string;
    name?: string;
    username?: string;
    title?: string;
    avatar_url?: string;
    recommendation_score: number;
    reason: string;
    type: 'friend' | 'moment';
    when_at?: string;
    place?: any;
    participants?: any[];
  };
  onAction?: (id: string, type: 'friend' | 'moment') => void;
  isLoading?: boolean;
}

export function RecommendationCard({ recommendation, onAction, isLoading }: RecommendationCardProps) {
  const isFriend = recommendation.type === 'friend';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={recommendation.avatar_url} />
            <AvatarFallback>
              {isFriend ? 
                (recommendation.name?.[0] || recommendation.username?.[0] || 'U') :
                (recommendation.title?.[0] || 'M')
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm truncate">
                {isFriend ? 
                  (recommendation.name || recommendation.username) :
                  recommendation.title
                }
              </h3>
              <Badge variant="secondary" className="text-xs">
                {Math.round(recommendation.recommendation_score)}% match
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {recommendation.reason}
            </p>
            
            {/* Moment-specific info */}
            {!isFriend && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                {recommendation.when_at && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {formatDistanceToNow(new Date(recommendation.when_at), {
                        addSuffix: true,
                        locale: it
                      })}
                    </span>
                  </div>
                )}
                
                {recommendation.place?.name && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate">{recommendation.place.name}</span>
                  </div>
                )}
                
                {recommendation.participants && (
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{recommendation.participants.length} partecipanti</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onAction?.(recommendation.id, recommendation.type)}
                disabled={isLoading}
                className="flex-1 h-8 text-xs"
              >
                {isFriend ? (
                  <>
                    <UserPlus size={12} className="mr-1" />
                    Segui
                  </>
                ) : (
                  <>
                    <Users size={12} className="mr-1" />
                    Partecipa
                  </>
                )}
              </Button>
              
              {isFriend && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                >
                  <MessageCircle size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}