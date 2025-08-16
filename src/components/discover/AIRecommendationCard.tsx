import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Calendar, MapPin, Star } from 'lucide-react';

interface AIRecommendationCardProps {
  type: 'person' | 'event' | 'location' | 'artist';
  image?: string;
  title: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  actionLabel: string;
  onAction: () => void;
  aiReason?: string;
  rating?: number;
  location?: string;
  date?: string;
}

export function AIRecommendationCard({
  type,
  image,
  title,
  subtitle,
  description,
  tags = [],
  actionLabel,
  onAction,
  aiReason,
  rating,
  location,
  date
}: AIRecommendationCardProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'person': return <Users className="h-3 w-3" />;
      case 'event': return <Calendar className="h-3 w-3" />;
      case 'location': return <MapPin className="h-3 w-3" />;
      case 'artist': return <Star className="h-3 w-3" />;
    }
  };

  const getImagePlaceholder = () => {
    const gradients = {
      person: 'from-blue-500/20 to-purple-500/20',
      event: 'from-green-500/20 to-emerald-500/20',
      location: 'from-orange-500/20 to-red-500/20',
      artist: 'from-pink-500/20 to-rose-500/20'
    };
    return gradients[type];
  };

  return (
    <Card className="w-72 flex-shrink-0 group hover-scale border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-elevated">
      <CardContent className="p-0">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-t-xl">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`h-40 w-full bg-gradient-to-br ${getImagePlaceholder()} flex items-center justify-center`}>
              <div className="text-4xl opacity-50">
                {getTypeIcon()}
              </div>
            </div>
          )}
          
          {/* AI Badge */}
          <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground border-0 shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Consigliato
          </Badge>

          {/* Rating */}
          {rating && (
            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
              <Star className="h-3 w-3 inline mr-1 fill-current text-yellow-400" />
              {rating}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-card-foreground line-clamp-1">{title}</h4>
            {subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-1">{subtitle}</p>
            )}
          </div>

          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}

          {/* Meta Info */}
          <div className="space-y-2">
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{date}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* AI Reason */}
          {aiReason && (
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <p className="text-xs text-primary font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Perché te lo consiglio:
              </p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{aiReason}</p>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={onAction}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-brand/20 hover:shadow-brand/40 transition-all duration-200"
          >
            {actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}