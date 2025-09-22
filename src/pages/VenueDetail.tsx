import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Star,
  Users,
  Calendar,
  MessageCircle,
  Heart,
  Phone,
  Mail,
  Clock,
  Music,
  Zap,
  Wifi
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const fetchVenueDetail = async (venueId: string) => {
  console.log('Fetching venue with ID:', venueId);
  
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', venueId)
    .single();

  console.log('Venue query result:', { data, error });

  if (error) throw error;
  return data;
};

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log('VenueDetail - ID from URL:', id);

  const { data: venue, isLoading, error } = useQuery({
    queryKey: ['venue-detail', id],
    queryFn: () => fetchVenueDetail(id!),
    enabled: !!id,
  });

  console.log('VenueDetail - Query state:', { venue, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento venue...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Venue non trovata</p>
          <Button onClick={() => navigate('/')}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  const location = venue.location as any;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{venue.name} - LiveMoment</title>
        <meta name="description" content={venue.description} />
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
          <h1 className="text-lg font-semibold">Profilo Venue</h1>
        </div>

        {/* Hero Section */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 avatar-ring">
                  <AvatarImage src={venue.images?.[0]} />
                  <AvatarFallback className="gradient-brand text-white text-2xl">
                    {venue.name?.charAt(0) || 'V'}
                  </AvatarFallback>
                </Avatar>
                {venue.verified && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary border-2 border-background rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-primary-foreground fill-current" />
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {venue.name}
                </h1>
                {venue.venue_type && (
                  <p className="text-muted-foreground">{venue.venue_type}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {venue.capacity && (
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {venue.capacity} persone
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary fill-current" />
                  <span className="text-foreground font-medium">4.6</span>
                </div>
                {venue.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Capienza {venue.capacity}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{location.address}, {location.city}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery */}
        {venue.venue_photos && venue.venue_photos.length > 0 && (
          <Card className="shadow-card">
            <CardHeader>
              <h3 className="font-semibold">Galleria Foto</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {venue.venue_photos.slice(0, 6).map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo}
                      alt={`${venue.name} foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {venue.description && (
          <Card className="shadow-card">
            <CardHeader>
              <h3 className="font-semibold">Descrizione</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Technical Details */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="font-semibold">Dettagli Tecnici</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venue.max_capacity_seated && (
                <div>
                  <h4 className="font-medium mb-2">Capienza Seduti</h4>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{venue.max_capacity_seated} persone</span>
                  </div>
                </div>
              )}
              
              {venue.max_capacity_standing && (
                <div>
                  <h4 className="font-medium mb-2">Capienza In Piedi</h4>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{venue.max_capacity_standing} persone</span>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Setup */}
            {venue.audio_setup && venue.audio_setup.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attrezzature Audio</h4>
                <div className="flex flex-wrap gap-2">
                  {venue.audio_setup.map((equipment) => (
                    <Badge key={equipment} variant="outline">
                      <Music className="h-3 w-3 mr-1" />
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Equipment */}
            {venue.additional_equipment && venue.additional_equipment.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Attrezzature Aggiuntive</h4>
                <div className="flex flex-wrap gap-2">
                  {venue.additional_equipment.map((equipment) => (
                    <Badge key={equipment} variant="secondary">
                      <Zap className="h-3 w-3 mr-1" />
                      {equipment}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities & Services */}
        {(venue.amenities || venue.services) && (
          <Card className="shadow-card">
            <CardHeader>
              <h3 className="font-semibold">Servizi e Comfort</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.amenities && venue.amenities.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Comfort</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        <Wifi className="h-3 w-3 mr-1" />
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {venue.services && venue.services.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Servizi</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Artist Benefits */}
        {venue.artist_welcome_message && (
          <Card className="shadow-card">
            <CardHeader>
              <h3 className="font-semibold">Per gli Artisti</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {venue.artist_welcome_message}
              </p>
              
              {venue.artist_benefits && venue.artist_benefits.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Vantaggi per Artisti</h4>
                  <div className="flex flex-wrap gap-2">
                    {venue.artist_benefits.map((benefit) => (
                      <Badge key={benefit} variant="outline">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {venue.special_offer && (
                <div>
                  <h4 className="font-medium mb-2">Offerta Speciale</h4>
                  <p className="text-muted-foreground">{venue.special_offer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Opening Hours */}
        {venue.opening_hours && (
          <Card className="shadow-card">
            <CardHeader>
              <h3 className="font-semibold">Orari di Apertura</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {JSON.stringify(venue.opening_hours)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        <Card className="shadow-card">
          <CardHeader>
            <h3 className="font-semibold">Contatti</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {venue.contact_phone && (
              <div>
                <h4 className="font-medium mb-1">Telefono</h4>
                <a href={`tel:${venue.contact_phone}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <Phone className="h-4 w-4" />
                  {venue.contact_phone}
                </a>
              </div>
            )}
            
            {venue.contact_email && (
              <div>
                <h4 className="font-medium mb-1">Email</h4>
                <a href={`mailto:${venue.contact_email}`} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                  <Mail className="h-4 w-4" />
                  {venue.contact_email}
                </a>
              </div>
            )}

            {venue.contact_person_name && (
              <div>
                <h4 className="font-medium mb-1">Persona di Contatto</h4>
                <p className="text-muted-foreground">
                  {venue.contact_person_name} {venue.contact_person_surname}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-elevated p-4">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button size="lg" className="flex-1 shadow-brand">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatta Venue
            </Button>
            <Button variant="outline" size="lg" className="px-4">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-24" />
      </div>
    </div>
  );
}