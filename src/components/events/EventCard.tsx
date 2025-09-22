import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock,
  Music,
  Palette
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    when_at: string;
    place: any;
    max_participants: number;
    tags: string[];
    photos: string[];
  };
  artists?: Array<{
    artists: {
      name: string;
      stage_name?: string;
      avatar_url?: string;
      artist_type?: string;
    };
  }>;
  venues?: Array<{
    venues: {
      name: string;
      venue_type?: string;
    };
  }>;
}

export function EventCard({ event, artists = [], venues = [] }: EventCardProps) {
  const navigate = useNavigate();

  const getCategoryIcon = (tag: string) => {
    if (tag.includes('music') || tag.includes('jazz') || tag.includes('electronic')) {
      return <Music className="h-3 w-3" />;
    }
    if (tag.includes('art') || tag.includes('arte')) {
      return <Palette className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group" 
          onClick={() => navigate(`/event/${event.id}`)}>
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
        <img 
          src={event.photos?.[0] || '/livemoment-mascot.png'} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>
          
          {/* Tags */}
          <div className="flex gap-1 flex-wrap">
            {event.tags?.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {getCategoryIcon(tag)}
                <span className="ml-1">{tag}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {event.when_at && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.when_at), "d MMM yyyy", { locale: it })}</span>
              <Clock className="h-3 w-3 ml-1" />
              <span>{format(new Date(event.when_at), "HH:mm")}</span>
            </div>
          )}
          
          {event.place && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.place.name || 'Location evento'}</span>
            </div>
          )}
          
          {event.max_participants && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Fino a {event.max_participants} partecipanti</span>
            </div>
          )}
        </div>

        {/* Artists Preview */}
        {artists.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4" />
              <span className="text-sm font-medium">Artisti</span>
            </div>
            <div className="flex -space-x-2">
              {artists.slice(0, 3).map((eventArtist, index) => (
                <Avatar key={index} className="w-6 h-6 border-2 border-background">
                  <AvatarImage src={eventArtist.artists.avatar_url || '/livemoment-mascot.png'} />
                  <AvatarFallback className="text-xs">
                    {eventArtist.artists.name[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {artists.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{artists.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Venues Preview */}
        {venues.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {venues[0].venues.name}
              {venues.length > 1 && ` +${venues.length - 1} altre`}
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Action Button */}
        <Button className="w-full mt-3" onClick={(e) => {
          e.stopPropagation();
          navigate(`/event/${event.id}`);
        }}>
          Scopri di più
        </Button>
      </CardContent>
    </Card>
  );
}