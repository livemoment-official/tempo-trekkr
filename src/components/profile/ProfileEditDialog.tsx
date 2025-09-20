import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve essere almeno 2 caratteri'),
  username: z.string().min(3, 'Username deve essere almeno 3 caratteri'),
  bio: z.string().optional(),
  job_title: z.string().optional(),
  relationship_status: z.string().optional(),
  instagram_username: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditDialogProps {
  open: boolean;
  onClose: () => void;
  profile?: any;
}

const moodOptions = [
  'Energico', 'Chill', 'Creativo', 'Avventuroso', 'Sociale', 'Rilassato',
  'Motivato', 'Curioso', 'Divertente', 'Spontaneo', 'Positivo', 'Zen'
];

const genderOptions = [
  { value: 'Uomo', label: 'Uomo' },
  { value: 'Donna', label: 'Donna' },
  { value: 'Non binario', label: 'Non binario' },
  { value: 'Preferisco non definirlo', label: 'Preferisco non definirlo' }
];

export function ProfileEditDialog({ open, onClose, profile }: ProfileEditDialogProps) {
  const { user } = useAuth();
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [moods, setMoods] = useState<string[]>(
    profile?.mood 
      ? (typeof profile.mood === 'string' 
          ? profile.mood.split(', ').filter(m => m.length > 0)
          : Array.isArray(profile.mood) 
            ? profile.mood 
            : []
        )
      : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      job_title: profile?.job_title || '',
      relationship_status: profile?.relationship_status || '',
      instagram_username: profile?.instagram_username || '',
      gender: profile?.gender || '',
    },
  });

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const toggleMood = (mood: string) => {
    if (moods.includes(mood)) {
      setMoods(moods.filter(m => m !== mood));
    } else {
      setMoods([...moods, mood]);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success('Avatar caricato con successo');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Errore nel caricamento dell\'avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const profileData = {
        ...data,
        interests,
        mood: moods.length > 0 ? moods.join(', ') : null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...profileData 
        });

      if (error) throw error;

      toast.success('Profilo aggiornato con successo');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 bg-background border-b px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Modifica Profilo</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pt-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    {form.watch('name')?.slice(0, 2)?.toUpperCase() || 'LM'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Cambia Avatar
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Il tuo nome" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="@username" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Raccontaci qualcosa di te..." />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Gender and Job Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genere</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona genere" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {genderOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lavoro</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Il tuo lavoro" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="relationship_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relazione</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Single, In coppia..." />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="@instagram" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Mood Multi-Select */}
              <div className="space-y-3">
                <FormLabel>Mood (seleziona tutti quelli che ti rappresentano)</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => toggleMood(mood)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        moods.includes(mood)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
                {moods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {moods.map((mood) => (
                      <Badge key={mood} variant="secondary" className="cursor-pointer">
                        {mood}
                        <X
                          className="h-3 w-3 ml-1"
                          onClick={() => toggleMood(mood)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <FormLabel>Interessi</FormLabel>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Aggiungi interesse"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button type="button" onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer">
                      {interest}
                      <X
                        className="h-3 w-3 ml-1"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background border-t -mx-6 px-6 py-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : 'Salva'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}