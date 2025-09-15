import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, Plus, Upload, ArrowLeft } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { ArtistProfile } from '@/hooks/useUserProfiles';

const artistSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  bio: z.string().optional(),
  genres: z.array(z.string()).optional(),
  location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type ArtistFormData = z.infer<typeof artistSchema>;

interface CreateArtistProfileProps {
  onSubmit: (data: Omit<ArtistProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const commonGenres = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Elettronica', 'Hip Hop', 'Reggae', 'Folk',
  'Classica', 'Metal', 'Punk', 'R&B', 'Country', 'Indie', 'Funk', 'Soul'
];

export function CreateArtistProfile({ onSubmit, onCancel, loading }: CreateArtistProfileProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [genres, setGenres] = useState<string[]>([]);
  const [newGenre, setNewGenre] = useState('');
  
  const { uploadImage, isUploading } = useImageUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ArtistFormData>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      genres: []
    }
  });

  const handleAvatarUpload = async (file: File) => {
    const url = await uploadImage(file, { bucket: 'avatars' });
    if (url) {
      setAvatarUrl(url);
    }
  };

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      const updatedGenres = [...genres, genre];
      setGenres(updatedGenres);
      setValue('genres', updatedGenres);
      setNewGenre('');
    }
  };

  const removeGenre = (genre: string) => {
    const updatedGenres = genres.filter(g => g !== genre);
    setGenres(updatedGenres);
    setValue('genres', updatedGenres);
  };

  const onFormSubmit = async (data: ArtistFormData) => {
    await onSubmit({
      name: data.name,
      bio: data.bio,
      location: data.location,
      avatar_url: avatarUrl,
      genres: genres.length > 0 ? genres : undefined,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Crea Profilo Artista</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                <Upload className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
                className="hidden"
                id="avatar-upload"
              />
              <Label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Caricamento...' : 'Carica foto'}
              </Label>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome artistico *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Il tuo nome artistico"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Biografia</Label>
              <Textarea
                id="bio"
                {...register('bio')}
                placeholder="Racconta qualcosa di te e della tua musica..."
                rows={4}
              />
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <Label>Generi musicali</Label>
            
            {/* Selected genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                    {genre}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeGenre(genre)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add custom genre */}
            <div className="flex gap-2">
              <Input
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                placeholder="Aggiungi genere"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGenre(newGenre);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addGenre(newGenre)}
                disabled={!newGenre}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common genres */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Generi popolari:</p>
              <div className="flex flex-wrap gap-2">
                {commonGenres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => addGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label>Localizzazione (opzionale)</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Input
                  {...register('location.city')}
                  placeholder="Città"
                />
              </div>
              <div>
                <Input
                  {...register('location.country')}
                  placeholder="Paese"
                />
              </div>
            </div>
            <div>
              <Input
                {...register('location.address')}
                placeholder="Indirizzo completo"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading || isUploading}>
              {loading ? 'Creazione...' : 'Crea Profilo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}