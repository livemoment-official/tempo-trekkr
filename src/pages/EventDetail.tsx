import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Star,
  Ticket,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useEventDetails } from "@/hooks/useEventDetails";


export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: eventDetails, isLoading, error } = useEventDetails(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento evento...</p>
        </div>
      </div>
    );
  }

  if (error || !eventDetails?.event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Evento non trovato</p>
          <Button onClick={() => navigate('/')}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  const { event, artists, venues } = eventDetails;

  const getCategoryEmoji = (tag: string) => {
    const categories: Record<string, string> = {
      'musica': '🎵',
      'arte': '🎨',
      'sport': '🏃',
      'festival': '🎪',
      'conferenza': '🗣️',
      'workshop': '🛠️',
      'party': '🎉',
      'teatro': '🎭',
      'cinema': '🎬',
      'danza': '💃'
    };
    return categories[tag.toLowerCase()] || '🎫';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invited':
      case 'contacted':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'invited': return 'Invitato';
      case 'accepted': return 'Accettato';
      case 'confirmed': return 'Confermato';
      case 'declined': return 'Rifiutato';
      case 'contacted': return 'Contattato';
      case 'interested': return 'Interessato';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{event.title} - LiveMoment</title>
        <meta name="description" content={event.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Dettagli Evento</h1>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
          {event.photos && event.photos.length > 0 ? (
            <img 
              src={event.photos[0]} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-8xl">
                {event.tags && event.tags.length > 0 
                  ? getCategoryEmoji(event.tags[0])
                  : '🎫'
                }
              </span>
            </div>
          )}
          
          {/* Tags overlay */}
          <div className="absolute top-4 left-4">
            {event.tags && event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="mr-2 bg-white/90 backdrop-blur-sm">
                {getCategoryEmoji(tag)} {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Main Info */}
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-2">
              {event.tags && event.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Date & Time */}
            {event.when_at && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.when_at), "EEEE d MMMM yyyy", { locale: it })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.when_at), "HH:mm")}
                  </p>
                </div>
              </div>
            )}
            
            {/* Location */}
            {event.place && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {typeof event.place === 'object' && event.place !== null && 'name' in event.place 
                      ? (event.place as any).name 
                      : 'Location evento'}
                  </p>
                  {typeof event.place === 'object' && event.place !== null && 'address' in event.place && (
                    <p className="text-sm text-muted-foreground">{(event.place as any).address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Capacity */}
            {event.capacity && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Fino a {event.capacity} partecipanti</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descrizione</h3>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Artists Section */}
        {artists.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Artisti Invitati ({artists.length})</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artists.map((eventArtist: any) => (
                  <div key={eventArtist.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={eventArtist.artists.avatar_url || '/livemoment-mascot.png'} />
                      <AvatarFallback>
                        {eventArtist.artists.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{eventArtist.artists.name}</h4>
                          {eventArtist.artists.stage_name && (
                            <p className="text-sm text-muted-foreground">({eventArtist.artists.stage_name})</p>
                          )}
                          <p className="text-sm text-muted-foreground">{eventArtist.artists.artist_type}</p>
                          {eventArtist.artists.bio && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{eventArtist.artists.bio}</p>
                          )}
                          <div className="flex gap-1 mt-2">
                            {eventArtist.artists.genres?.slice(0, 3).map((genre: string) => (
                              <Badge key={genre} variant="outline" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(eventArtist.status)}
                          <span className="text-sm font-medium">{getStatusText(eventArtist.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Venues Section */}
        {venues.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Location Contattate ({venues.length})</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venues.map((eventVenue: any) => (
                  <div key={eventVenue.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={(eventVenue.venues.images as string[] | null)?.[0] || '/livemoment-mascot.png'} />
                      <AvatarFallback>
                        <MapPin className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{eventVenue.venues.name}</h4>
                          <p className="text-sm text-muted-foreground">{eventVenue.venues.venue_type}</p>
                          {eventVenue.venues.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{eventVenue.venues.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {eventVenue.venues.capacity && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{eventVenue.venues.capacity} persone</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            {eventVenue.venues.amenities?.slice(0, 3).map((amenity: string) => (
                              <Badge key={amenity} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(eventVenue.status)}
                          <span className="text-sm font-medium">{getStatusText(eventVenue.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizer - Placeholder for now */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Organizzatore</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/livemoment-mascot.png" />
                <AvatarFallback>O</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">Organizzatore Evento</h4>
                <p className="text-sm text-muted-foreground">Informazioni disponibili presto</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <Ticket className="h-4 w-4 mr-2" />
              Partecipa all'Evento
            </Button>
            <Button variant="outline" size="lg">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}