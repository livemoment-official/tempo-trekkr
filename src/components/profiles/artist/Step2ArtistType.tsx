import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Youtube, Music } from 'lucide-react';

interface Step2ArtistTypeProps {
  data: any;
  updateData: (data: any) => void;
}

const artistTypes = [
  { value: 'musicisti', label: 'Musicisti', specializations: ['Cantante', 'Chitarrista', 'Pianista', 'Batterista', 'Bassista', 'Violinista', 'DJ', 'Band'] },
  { value: 'animatori', label: 'Animatori', specializations: ['Animazione bambini', 'Animazione eventi', 'Karaoke', 'Ballo di gruppo', 'Giochi'] },
  { value: 'ballerini', label: 'Ballerini', specializations: ['Danza classica', 'Danza moderna', 'Hip hop', 'Latino americano', 'Folcloristico'] },
  { value: 'comici', label: 'Comici', specializations: ['Stand-up comedy', 'Cabaret', 'Imitazioni', 'Teatro comico'] },
  { value: 'maghi', label: 'Maghi', specializations: ['Magia da palco', 'Close-up magic', 'Mentalismo', 'Giocoleria'] },
  { value: 'altri', label: 'Altri', specializations: ['Mimo', 'Artista di strada', 'Poeta', 'Narratore', 'Performance art'] }
];

export const Step2ArtistType: React.FC<Step2ArtistTypeProps> = ({ data, updateData }) => {
  const selectedArtistType = artistTypes.find(type => type.value === data.artist_type);

  const updateSocialMedia = (platform: string, value: string) => {
    updateData({
      social_media: {
        ...data.social_media,
        [platform]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tipo di Artista</h2>
        <p className="text-muted-foreground">Seleziona la tua categoria artistica e aggiungi i tuoi social</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="artist_type">Categoria Artistica *</Label>
          <Select
            value={data.artist_type}
            onValueChange={(value) => updateData({ artist_type: value, specialization: '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona il tipo di artista" />
            </SelectTrigger>
            <SelectContent>
              {artistTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedArtistType && (
          <div className="space-y-2">
            <Label htmlFor="specialization">Specializzazione *</Label>
            <Select
              value={data.specialization}
              onValueChange={(value) => updateData({ specialization: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona la tua specializzazione" />
              </SelectTrigger>
              <SelectContent>
                {selectedArtistType.specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Media</h3>
          <p className="text-sm text-muted-foreground">
            Aggiungi i tuoi profili social per far conoscere meglio il tuo lavoro
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <Label htmlFor="facebook">Facebook</Label>
                </div>
                <Input
                  id="facebook"
                  value={data.social_media?.facebook || ''}
                  onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <Label htmlFor="youtube">YouTube</Label>
                </div>
                <Input
                  id="youtube"
                  value={data.social_media?.youtube || ''}
                  onChange={(e) => updateSocialMedia('youtube', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-5 h-5 text-green-600" />
                  <Label htmlFor="spotify">Spotify</Label>
                </div>
                <Input
                  id="spotify"
                  value={data.social_media?.spotify || ''}
                  onChange={(e) => updateSocialMedia('spotify', e.target.value)}
                  placeholder="https://open.spotify.com/..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-5 h-5 text-orange-600" />
                  <Label htmlFor="soundcloud">SoundCloud</Label>
                </div>
                <Input
                  id="soundcloud"
                  value={data.social_media?.soundcloud || ''}
                  onChange={(e) => updateSocialMedia('soundcloud', e.target.value)}
                  placeholder="https://soundcloud.com/..."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};