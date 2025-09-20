import React, { useEffect, useState } from 'react';
import { useMyAvailability } from '@/hooks/useAvailability';
import { EnhancedAvailabilityCard } from './EnhancedAvailabilityCard';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface EnhancedAvailabilityListProps {
  onEditRequest?: (availability: Tables<'availability'>) => void;
}

export function EnhancedAvailabilityList({ onEditRequest }: EnhancedAvailabilityListProps) {
  const [userId, setUserId] = useState<string | undefined>();
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  const { data: availabilities, isLoading, error } = useMyAvailability(userId);

  if (!userId) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Accedi per gestire le tue disponibilità
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive text-center py-4">
        Errore nel caricamento delle disponibilità
      </div>
    );
  }

  if (!availabilities || availabilities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-sm text-muted-foreground mb-2">
          Nessuna disponibilità programmata
        </div>
        <div className="text-xs text-muted-foreground">
          Aggiungi i tuoi orari liberi per ricevere inviti
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availabilities.map((availability) => (
        <EnhancedAvailabilityCard
          key={availability.id}
          availability={availability}
          userId={userId}
          onEditRequest={onEditRequest}
        />
      ))}
    </div>
  );
}