import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  MapPin, 
  Music, 
  Clock, 
  Users, 
  Euro,
  Facebook,
  Youtube,
  Play,
  CheckCircle 
} from 'lucide-react';

interface Step5ReviewProps {
  data: any;
  updateData?: (data: any) => void;
}

export const Step5Review: React.FC<Step5ReviewProps> = ({ data }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Revisione Profilo</h2>
        <p className="text-muted-foreground">Controlla che tutte le informazioni siano corrette</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card Preview */}
        <Card>
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={data.avatar_url} alt="Foto profilo" />
              <AvatarFallback className="text-2xl">
                {data.stage_name?.charAt(0)?.toUpperCase() || data.name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="flex items-center justify-center gap-2">
              {data.stage_name}
              <CheckCircle className="w-5 h-5 text-green-600" />
            </CardTitle>
            <p className="text-sm text-muted-foreground">{data.specialization}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{data.name}, {data.age} anni</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{data.province}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{data.phone}</span>
            </div>
            {data.experience_years > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{data.experience_years} anni di esperienza</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="space-y-4">
          {/* Artist Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Music className="w-5 h-5" />
                Tipo Artista
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">{data.artist_type}</Badge>
                <Badge variant="outline">{data.specialization}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Performance Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.audience_size && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>Pubblico: {data.audience_size}</span>
                </div>
              )}
              {data.performance_duration && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Durata: {data.performance_duration}</span>
                </div>
              )}
              {(data.cachet_info?.min_price || data.cachet_info?.max_price) && (
                <div className="flex items-center gap-2 text-sm">
                  <Euro className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Prezzo: {data.cachet_info?.min_price && `€${data.cachet_info.min_price}`}
                    {(data.cachet_info?.min_price && data.cachet_info?.max_price) && ' - '}
                    {data.cachet_info?.max_price && `€${data.cachet_info.max_price}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          {Object.values(data.social_media || {}).some(url => url) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.social_media?.facebook && (
                  <div className="flex items-center gap-2 text-sm">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="truncate">{data.social_media.facebook}</span>
                  </div>
                )}
                {data.social_media?.youtube && (
                  <div className="flex items-center gap-2 text-sm">
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span className="truncate">{data.social_media.youtube}</span>
                  </div>
                )}
                {data.social_media?.spotify && (
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="w-4 h-4 text-green-600" />
                    <span className="truncate">{data.social_media.spotify}</span>
                  </div>
                )}
                {data.social_media?.soundcloud && (
                  <div className="flex items-center gap-2 text-sm">
                    <Music className="w-4 h-4 text-orange-600" />
                    <span className="truncate">{data.social_media.soundcloud}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      {data.exhibition_description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Descrizione</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{data.exhibition_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Ideal Situations */}
      {data.ideal_situations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Situazioni Ideali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.ideal_situations.map((situation: string) => (
                <Badge key={situation} variant="outline">
                  {situation}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Types */}
      {data.event_types?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipi di Eventi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.event_types.map((type: string) => (
                <Badge key={type} variant="secondary">
                  {type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruments */}
      {data.instruments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strumenti Musicali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.instruments.map((instrument: string) => (
                <Badge key={instrument} variant="outline">
                  <Music className="w-3 h-3 mr-1" />
                  {instrument}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {data.profile_video_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="w-5 h-5" />
              Video di Presentazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground truncate">
              {data.profile_video_url}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-center text-muted-foreground">
          Clicca su "Completa Registrazione" per salvare il tuo profilo artista. 
          Potrai modificarlo in qualsiasi momento dalla tua area profilo.
        </p>
      </div>
    </div>
  );
};