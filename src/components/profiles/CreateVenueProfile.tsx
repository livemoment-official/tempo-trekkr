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
import { X, Plus, ArrowLeft } from 'lucide-react';
import type { VenueProfile } from '@/hooks/useUserProfiles';

const venueSchema = z.object({
  name: z.string().min(2, 'Il nome deve contenere almeno 2 caratteri'),
  description: z.string().optional(),
  capacity: z.number().min(1, 'La capienza deve essere almeno 1').optional(),
  location: z.object({
    address: z.string().min(1, 'L\'indirizzo è obbligatorio'),
    city: z.string().min(1, 'La città è obbligatoria'),
    country: z.string().min(1, 'Il paese è obbligatorio'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  amenities: z.array(z.string()).optional(),
});

type VenueFormData = z.infer<typeof venueSchema>;

interface CreateVenueProfileProps {
  onSubmit: (data: Omit<VenueProfile, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'verified'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const commonAmenities = [
  'Parcheggio', 'Wi-Fi', 'Aria condizionata', 'Impianto audio', 'Luci professionali',
  'Palco', 'Bar', 'Cucina', 'Toilette', 'Accesso disabili', 'Spazio esterno',
  'Deposito', 'Spogliatoi', 'Sistema di sicurezza'
];

export function CreateVenueProfile({ onSubmit, onCancel, loading }: CreateVenueProfileProps) {
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      amenities: []
    }
  });

  const addAmenity = (amenity: string) => {
    if (amenity && !amenities.includes(amenity)) {
      const updatedAmenities = [...amenities, amenity];
      setAmenities(updatedAmenities);
      setValue('amenities', updatedAmenities);
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    const updatedAmenities = amenities.filter(a => a !== amenity);
    setAmenities(updatedAmenities);
    setValue('amenities', updatedAmenities);
  };

  const onFormSubmit = async (data: VenueFormData) => {
    await onSubmit({
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      location: data.location,
      amenities: amenities.length > 0 ? amenities : undefined,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Crea Profilo Location</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome location *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nome del tuo spazio"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrivi il tuo spazio, l'atmosfera, cosa lo rende speciale..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capienza (persone)</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="Numero massimo di persone"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive mt-1">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <Label>Indirizzo *</Label>
            <div className="space-y-4">
              <div>
                <Input
                  {...register('location.address')}
                  placeholder="Via, numero civico"
                />
                {errors.location?.address && (
                  <p className="text-sm text-destructive mt-1">{errors.location.address.message}</p>
                )}
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input
                    {...register('location.city')}
                    placeholder="Città"
                  />
                  {errors.location?.city && (
                    <p className="text-sm text-destructive mt-1">{errors.location.city.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    {...register('location.country')}
                    placeholder="Paese"
                  />
                  {errors.location?.country && (
                    <p className="text-sm text-destructive mt-1">{errors.location.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <Label>Servizi e dotazioni</Label>
            
            {/* Selected amenities */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAmenity(amenity)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Add custom amenity */}
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Aggiungi servizio"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity(newAmenity);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addAmenity(newAmenity)}
                disabled={!newAmenity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Common amenities */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Servizi comuni:</p>
              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => addAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Profilo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}