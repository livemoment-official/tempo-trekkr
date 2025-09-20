import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Availability {
  id: string;
  is_on: boolean;
  shareable: boolean;
  start_at?: string;
  end_at?: string;
}

export function AvailabilityToggle() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const toggleAvailability = async (enabled: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      if (availability) {
        // Update existing availability
        const { error } = await supabase
          .from('availability')
          .update({ 
            is_on: enabled,
            shareable: enabled ? availability.shareable : false,
            updated_at: new Date().toISOString()
          })
          .eq('id', availability.id);

        if (error) throw error;
        
        setAvailability({ ...availability, is_on: enabled, shareable: enabled ? availability.shareable : false });
      } else {
        // Create new availability
        const { data, error } = await supabase
          .from('availability')
          .insert({
            user_id: user.id,
            is_on: enabled,
            shareable: enabled
          })
          .select()
          .single();

        if (error) throw error;
        setAvailability(data);
      }
      
      toast.success(enabled ? 'Sei ora disponibile' : 'Non sei più disponibile');
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Errore nell\'aggiornamento della disponibilità');
    } finally {
      setIsLoading(false);
    }
  };

  const updateShareable = async (shareable: boolean) => {
    if (!availability || !user) return;

    try {
      const { error } = await supabase
        .from('availability')
        .update({ 
          shareable,
          updated_at: new Date().toISOString()
        })
        .eq('id', availability.id);

      if (error) throw error;
      
      setAvailability({ ...availability, shareable });
      toast.success(shareable ? 'Disponibilità ora visibile ad altri' : 'Disponibilità ora privata');
    } catch (error) {
      console.error('Error updating shareability:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  return (
    <>
      <Card className="shadow-card hover:shadow-sm transition-smooth">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${availability?.is_on ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Clock className={`h-4 w-4 ${availability?.is_on ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <div className="font-medium">Disponibilità</div>
                <div className="text-xs text-muted-foreground">
                  {availability?.is_on ? 'Disponibile per nuove connessioni' : 'Non disponibile'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="h-auto p-0 text-xs text-primary hover:underline"
                >
                  Impostazioni avanzate
                </Button>
              </div>
            </div>
            <Switch
              checked={availability?.is_on || false}
              onCheckedChange={toggleAvailability}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Impostazioni Disponibilità</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Stato disponibile</div>
                  <div className="text-sm text-muted-foreground">
                    Mostra che sei attivo e disponibile
                  </div>
                </div>
                <Switch
                  checked={availability?.is_on || false}
                  onCheckedChange={toggleAvailability}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Visibile ad altri</div>
                  <div className="text-sm text-muted-foreground">
                    Altri utenti possono vedere che sei disponibile
                  </div>
                </div>
                <Switch
                  checked={availability?.shareable || false}
                  onCheckedChange={updateShareable}
                  disabled={!availability?.is_on}
                />
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Quando sei disponibile, gli altri utenti vicini possono trovarti e invitarti a eventi</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}