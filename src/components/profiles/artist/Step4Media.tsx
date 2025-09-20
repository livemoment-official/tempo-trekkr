import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Video, Music, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Step4MediaProps {
  data: any;
  updateData: (data: any) => void;
}

export const Step4Media: React.FC<Step4MediaProps> = ({ data, updateData }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Errore',
        description: 'Il file è troppo grande. Massimo 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      updateData({ avatar_url: publicUrl });
      
      toast({
        title: 'Successo',
        description: 'Foto profilo caricata con successo!'
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Errore durante il caricamento della foto.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Media e Contenuti</h2>
        <p className="text-muted-foreground">Aggiungi foto e video per mostrare il tuo talento</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="space-y-4">
          <Label>Foto Profilo *</Label>
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={data.avatar_url} alt="Foto profilo" />
              <AvatarFallback className="text-2xl">
                {data.stage_name?.charAt(0)?.toUpperCase() || data.name?.charAt(0)?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="relative overflow-hidden"
                disabled={isUploading}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleAvatarUpload}
                />
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Caricamento...' : 'Carica Foto'}
              </Button>
              <p className="text-sm text-muted-foreground">
                Formati supportati: JPG, PNG (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Video Presentation */}
        <div className="space-y-2">
          <Label htmlFor="profile_video_url">Video di Presentazione</Label>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-muted-foreground" />
            <Input
              id="profile_video_url"
              value={data.profile_video_url || ''}
              onChange={(e) => updateData({ profile_video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... o link diretto al video"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Aggiungi un video che mostri le tue performance (YouTube, Vimeo o link diretto)
          </p>
        </div>

        {/* Instruments for musicians */}
        {data.artist_type === 'musicisti' && (
          <div className="space-y-3">
            <Label>Strumenti Musicali</Label>
            <div className="space-y-2">
              <Input
                placeholder="Es: Chitarra acustica, Pianoforte, Voce..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value && !data.instruments?.includes(value)) {
                      updateData({
                        instruments: [...(data.instruments || []), value]
                      });
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Premi Invio per aggiungere ogni strumento
              </p>
              {data.instruments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.instruments.map((instrument: string, index: number) => (
                    <div key={index} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                      <Music className="w-3 h-3" />
                      {instrument}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 w-4 h-4 ml-1"
                        onClick={() => {
                          updateData({
                            instruments: data.instruments.filter((_: string, i: number) => i !== index)
                          });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing info */}
        <div className="space-y-4">
          <Label>Informazioni sui Prezzi (Opzionale)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_price">Prezzo Minimo (€)</Label>
              <Input
                id="min_price"
                type="number"
                min="0"
                value={data.cachet_info?.min_price || ''}
                onChange={(e) => updateData({
                  cachet_info: {
                    ...data.cachet_info,
                    min_price: parseInt(e.target.value) || undefined
                  }
                })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_price">Prezzo Massimo (€)</Label>
              <Input
                id="max_price"
                type="number"
                min="0"
                value={data.cachet_info?.max_price || ''}
                onChange={(e) => updateData({
                  cachet_info: {
                    ...data.cachet_info,
                    max_price: parseInt(e.target.value) || undefined
                  }
                })}
                placeholder="500"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            I prezzi sono indicativi e possono essere negoziati per ogni evento
          </p>
        </div>

        {/* Tips */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Suggerimenti per i Media
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Usa foto di qualità che ti ritraggano durante una performance</li>
            <li>• Il video di presentazione dovrebbe durare 1-3 minuti</li>
            <li>• Mostra la tua personalità e il tuo stile artistico</li>
            <li>• Assicurati che audio e video siano di buona qualità</li>
          </ul>
        </div>
      </div>
    </div>
  );
};