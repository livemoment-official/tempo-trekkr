import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfilePhotoPreviewProps {
  profile: any;
  onProfileUpdate: () => void;
}

export function ProfilePhotoPreview({ profile, onProfileUpdate }: ProfilePhotoPreviewProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewPhotos, setPreviewPhotos] = useState<string[]>(profile?.gallery || []);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `preview-${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('galleries')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('galleries')
        .getPublicUrl(fileName);

      const newPhotos = [...previewPhotos, publicUrl];
      setPreviewPhotos(newPhotos);

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ gallery: newPhotos })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Foto aggiunta con successo');
      onProfileUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Errore nel caricamento della foto');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async (photoUrl: string) => {
    try {
      const newPhotos = previewPhotos.filter(photo => photo !== photoUrl);
      setPreviewPhotos(newPhotos);

      const { error } = await supabase
        .from('profiles')
        .update({ gallery: newPhotos })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Foto rimossa');
      onProfileUpdate();
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Errore nella rimozione della foto');
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Anteprima Profilo</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="preview-photo-upload"
          />
          <label htmlFor="preview-photo-upload">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              asChild
              disabled={isUploading || previewPhotos.length >= 6}
            >
              <span className="cursor-pointer">
                <Plus className="h-3 w-3 mr-1" />
                Aggiungi
              </span>
            </Button>
          </label>
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Mostra il tuo mondo attraverso foto che rappresentano i tuoi interessi e stile di vita
        </div>

        {previewPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {previewPhotos.slice(0, 6).map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <img 
                  src={photo} 
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(photo)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-3">
              <Camera className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Nessuna foto ancora
            </p>
            <p className="text-xs text-muted-foreground">
              Aggiungi foto per mostrare il tuo profilo
            </p>
          </div>
        )}

        {previewPhotos.length >= 6 && (
          <div className="mt-3 text-xs text-muted-foreground text-center">
            Massimo 6 foto per l'anteprima profilo
          </div>
        )}
      </CardContent>
    </Card>
  );
}