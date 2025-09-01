import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketPurchaseData {
  momentId: string;
  basePrice: number;
  livemomentFee: number;
  organizerFee: number;
  totalAmount: number;
  currency: string;
}

export interface PaymentSession {
  id: string;
  stripe_session_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

export function useMomentTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Purchase ticket for a moment
  const purchaseTicket = useCallback(async (momentId: string): Promise<{ url?: string; sessionId?: string; feeBreakdown?: any } | null> => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi effettuare l'accesso per acquistare un biglietto",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-ticket-payment', {
        body: { momentId }
      });

      if (error) {
        throw new Error(error.message || 'Errore nel creare la sessione di pagamento');
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Reindirizzamento al pagamento",
          description: "Si aprirà una nuova finestra per completare il pagamento"
        });
        
        return {
          url: data.url,
          sessionId: data.sessionId,
          feeBreakdown: data.feeBreakdown
        };
      }

      throw new Error('Nessun URL di pagamento ricevuto');
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      toast({
        title: "Errore acquisto biglietto",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Verify payment status
  const verifyPayment = useCallback(async (sessionId: string): Promise<{ success: boolean; status: string; participationConfirmed?: boolean } | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        throw new Error(error.message || 'Errore nella verifica del pagamento');
      }

      if (data?.success && data?.participationConfirmed) {
        toast({
          title: "Pagamento completato!",
          description: "La tua partecipazione è stata confermata"
        });
      } else if (data?.status === 'unpaid') {
        toast({
          title: "Pagamento non completato",
          description: "Il pagamento non è stato completato",
          variant: "destructive"
        });
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Errore verifica pagamento",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Get user's payment sessions
  const getPaymentSessions = useCallback(async (): Promise<PaymentSession[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('payment_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment sessions:', error);
      return [];
    }
  }, [user]);

  // Check if user has paid for a moment
  const hasUserPaidForMoment = useCallback(async (momentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('moment_participants')
        .select('payment_status')
        .eq('moment_id', momentId)
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }, [user]);

  return {
    purchaseTicket,
    verifyPayment,
    getPaymentSessions,
    hasUserPaidForMoment,
    isLoading
  };
}