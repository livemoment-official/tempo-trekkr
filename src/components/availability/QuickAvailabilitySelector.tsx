import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimePresence } from '@/hooks/useRealTimePresence';
import { toast } from 'sonner';

interface QuickAvailabilitySelectorProps {
  onAvailabilitySet?: () => void;
}

export function QuickAvailabilitySelector({ onAvailabilitySet }: QuickAvailabilitySelectorProps) {
  const { user } = useAuth();
  const { updatePresence } = useRealTimePresence();
  const [duration, setDuration] = useState('4');
  const [isLoading, setIsLoading] = useState(false);

  const durationOptions = [
    { value: '1', label: '1 ora' },
    { value: '2', label: '2 ore' },
    { value: '3', label: '3 ore' },
    { value: '4', label: '4 ore' },
    { value: '6', label: '6 ore' },
    { value: '8', label: '8 ore' }
  ];

  const setQuickAvailability = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      const now = new Date();
      const autoExpiry = new Date();
      autoExpiry.setHours(autoExpiry.getHours() + parseInt(duration));

      // First check if availability record exists
      const { data: existingData } = await supabase
        .from('availability')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const availabilityData = {
        user_id: user.id,
        is_on: true,
        shareable: true,
        start_at: now.toISOString(),
        end_at: autoExpiry.toISOString(),
        updated_at: now.toISOString()
      };

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('availability')
          .update(availabilityData)
          .eq('id', existingData.id);
        
        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('availability')
          .insert(availabilityData);
        
        if (error) throw error;
      }

      // Update presence status
      await updatePresence('Disponibile a uscire');
      
      toast.success(`Sei disponibile per ${durationOptions.find(d => d.value === duration)?.label}!`);
      onAvailabilitySet?.();
      
    } catch (error) {
      console.error('Error setting quick availability:', error);
      toast.error('Errore nell\'impostare la disponibilità');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={duration} onValueChange={setDuration}>
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        onClick={setQuickAvailability}
        disabled={isLoading}
        className="flex-1 bg-disponibile-uscire hover:bg-disponibile-uscire/90 text-disponibile-uscire-foreground"
        size="sm"
      >
        <Zap className="w-4 h-4 mr-2" />
        Disponibile ora
      </Button>
    </div>
  );
}