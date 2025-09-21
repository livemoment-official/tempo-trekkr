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
  Music,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  Play
} from "lucide-react";
import { Helmet } from "react-helmet-async";

const fetchArtistDetail = async (artistId: string) => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', artistId)
    .single();

  if (error) throw error;
  return data;
};

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist-detail', id],
    queryFn: () => fetchArtistDetail(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento artista...</p>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Artista non trovato</p>
          <Button onClick={() => navigate('/')}>Torna alla home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{artist.name || artist.stage_name} - LiveMoment</title>
        <meta name="description" content={artist.bio} />
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
          <h1 className="text-lg font-semibold">Profilo Artista</h1>
        </div>

        {/* Hero Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={artist.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-white text-2xl">
                    {artist.name?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                {artist.verified && (
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary border-2 border-background rounded-full flex items-center justify-center">
                    <Star className="h-3 w-3 text-white fill-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold">
                  {artist.stage_name || artist.name}
                </h1>
                {artist.stage_name && artist.name && (
                  <p className="text-muted-foreground">{artist.name}</p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {artist.genres && artist.genres.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="secondary">
                      <Music className="h-3 w-3 mr-1" />
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location */}
              {artist.province && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{artist.province}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        {artist.bio && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Bio</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{artist.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Informazioni</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Artist Type */}
            {artist.artist_type && (
              <div>
                <h4 className="font-medium mb-2">Tipo Artista</h4>
                <Badge variant="outline">{artist.artist_type}</Badge>
              </div>
            )}

            {/* Specialization */}
            {artist.specialization && (
              <div>
                <h4 className="font-medium mb-2">Specializzazione</h4>
                <p className="text-muted-foreground">{artist.specialization}</p>
              </div>
            )}

            {/* Experience */}
            {artist.experience_years && (
              <div>
                <h4 className="font-medium mb-2">Esperienza</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{artist.experience_years} anni</span>
                </div>
              </div>
            )}

            {/* Genres */}
            {artist.genres && artist.genres.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Generi Musicali</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Instruments */}
            {artist.instruments && artist.instruments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Strumenti</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.instruments.map((instrument) => (
                    <Badge key={instrument} variant="secondary">
                      {instrument}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Info */}
            {(artist.audience_size || artist.performance_duration) && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artist.audience_size && (
                    <div>
                      <h4 className="font-medium mb-2">Dimensione Pubblico</h4>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{artist.audience_size}</span>
                      </div>
                    </div>
                  )}
                  
                  {artist.performance_duration && (
                    <div>
                      <h4 className="font-medium mb-2">Durata Performance</h4>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-primary" />
                        <span>{artist.performance_duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Exhibition Description */}
        {artist.exhibition_description && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Descrizione Esibizione</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {artist.exhibition_description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Social Media */}
        {artist.social_media && Object.keys(artist.social_media).length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Social Media</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(artist.social_media).map(([platform, url]) => (
                  <a 
                    key={platform} 
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex gap-3">
            <Button size="lg" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              Contatta Artista
            </Button>
            <Button variant="outline" size="lg">
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