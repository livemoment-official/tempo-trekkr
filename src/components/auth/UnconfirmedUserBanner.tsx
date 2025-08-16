import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function UnconfirmedUserBanner() {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Non mostrare il banner se l'utente non è loggato, è confermato, o è stato nascosto
  if (!user || user.email_confirmed_at || isDismissed) {
    return null;
  }

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) {
        toast.error('Errore nell\'invio dell\'email');
      } else {
        toast.success('Email di conferma inviata!');
      }
    } catch (error) {
      toast.error('Errore nell\'invio dell\'email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          Il tuo account non è ancora confermato. Conferma la tua email per accedere a tutte le funzionalità.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendConfirmation}
            disabled={isResending}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {isResending ? 'Invio...' : 'Reinvia email'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="text-blue-700 hover:bg-blue-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}