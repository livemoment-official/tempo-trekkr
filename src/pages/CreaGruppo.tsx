import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StandardHeader from '@/components/layout/StandardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import LocationSearchInput from '@/components/location/LocationSearchInput';
import { useToast } from '@/hooks/use-toast';
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

export default function CreaGruppo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleLocationChange = (name: string, coordinates?: { lat: number; lng: number }) => {
    setFormData(prev => ({ ...prev, location: name }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) {
      toast({
        title: "Errore",
        description: "Inserisci titolo e categoria",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          title: formData.title,
          category: formData.category,
          location: formData.location ? { name: formData.location } : null,
          host_id: user?.id,
          participants: [user?.id],
          is_public: formData.isPublic,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Gruppo creato!",
        description: `Il gruppo "${formData.title}" è stato creato con successo.`,
      });

      navigate('/gruppi');
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il gruppo. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);
  const isFormValid = formData.title.trim() && formData.category;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StandardHeader title="Crea Gruppo" onBack={() => navigate('/crea')} />
      
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <Label htmlFor="title">Nome del gruppo</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="es. Aperitivi Milano Centro"
              className="mt-1.5"
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
                  className="h-auto p-3 flex flex-col items-center gap-1.5"
                >
                  <span className="text-xl">{category.emoji}</span>
                  <span className="text-xs leading-tight">{category.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Posizione</Label>
            <div className="mt-1.5">
              <LocationSearchInput
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Seleziona una zona..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-4 px-4 bg-card rounded-xl border">
            <div className="space-y-0.5">
              <Label>Visibilità del gruppo</Label>
              <p className="text-xs text-muted-foreground">
                {formData.isPublic ? 'Il gruppo sarà visibile a tutti' : 'Solo su invito'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Lock className={`h-4 w-4 ${!formData.isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Globe className={`h-4 w-4 ${formData.isPublic ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>

          {selectedCategory && formData.title && (
            <Card className="p-4">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Anteprima gruppo</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center text-2xl">
                  {selectedCategory.emoji}
                </div>
                <div>
                  <p className="font-semibold">{formData.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.location || "Posizione non specificata"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm p-4">
        <div className="max-w-2xl mx-auto">
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Creazione in corso..." : "Crea Gruppo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
