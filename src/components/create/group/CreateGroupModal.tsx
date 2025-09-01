import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LocationSearchInput from '@/components/location/LocationSearchInput';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { id: 'aperitivo', label: 'Aperitivo', emoji: '🍺' },
  { id: 'cena', label: 'Cena', emoji: '🍽️' },
  { id: 'caffe', label: 'Caffè', emoji: '☕' },
  { id: 'sport', label: 'Sport', emoji: '🏃' },
  { id: 'musica', label: 'Musica', emoji: '🎵' },
  { id: 'arte', label: 'Arte', emoji: '🎨' },
  { id: 'natura', label: 'Natura', emoji: '🌿' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'cinema', label: 'Cinema', emoji: '🎬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' }
];

interface CreateGroupModalProps {
  children: React.ReactNode;
}

export function CreateGroupModal({ children }: CreateGroupModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
  });

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleLocationChange = (name: string, coordinates?: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, location: name }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast({
        title: "Errore",
        description: "Inserisci titolo e categoria",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          title: formData.title,
          category: formData.category,
          location: formData.location ? { name: formData.location } : null,
          host_id: user?.id,
          participants: [user?.id],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Gruppo creato!",
        description: `Il gruppo "${formData.title}" è stato creato con successo.`,
      });

      // Reset form and close modal
      setFormData({ title: '', category: '', location: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il gruppo. Riprova.",
        variant: "destructive",
      });
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crea Nuovo Gruppo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Nome del gruppo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="es. Aperitivi Milano Centro"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={formData.category === category.id ? "default" : "outline"}
                  onClick={() => handleCategorySelect(category.id)}
                  className="h-auto p-3 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="text-xs">{category.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Posizione</Label>
            <div className="mt-2">
              <LocationSearchInput
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Seleziona una zona..."
              />
            </div>
          </div>

          {selectedCategory && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Anteprima gruppo:</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-2xl">
                  {selectedCategory.emoji}
                </div>
                <div>
                  <p className="font-medium">{formData.title || "Nome del gruppo"}</p>
                  <p className="text-sm text-muted-foreground">{formData.location || "Posizione"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Annulla
            </Button>
            <Button type="submit" className="flex-1">
              Crea Gruppo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}