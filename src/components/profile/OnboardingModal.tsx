import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import { LocationPermissionCard } from '@/components/location/LocationPermissionCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Benvenuto su LiveMoment! Il tuo profilo è stato configurato.');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Errore nel completamento dell\'onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">
            Completa il tuo profilo
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Aggiungi alcune informazioni per personalizzare la tua esperienza su LiveMoment
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <LocationPermissionCard />
          
          <ProfileEditForm
            onClose={handleComplete}
            profile={{
              name: '',
              username: '',
              bio: '',
              mood: '',
              job_title: '',
              relationship_status: '',
              instagram_username: '',
              interests: [],
              avatar_url: ''
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}