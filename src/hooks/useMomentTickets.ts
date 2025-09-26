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

  // Purchase ticket for a moment with retry logic
  const purchaseTicket = useCallback(async (momentId: string, retryCount = 0): Promise<{ url?: string; sessionId?: string; feeBreakdown?: any } | null> => {
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
      console.log(`🎫 [TICKET] Creating payment session for moment ${momentId}, attempt ${retryCount + 1}`);
      
      const { data, error } = await supabase.functions.invoke('create-ticket-payment', {
        body: { momentId }
      });

      if (error) {
        console.error(`🎫 [TICKET] Error from edge function:`, error);
        throw new Error(error.message || 'Errore nel creare la sessione di pagamento');
      }

      if (data?.url) {
        console.log(`🎫 [TICKET] Payment session created successfully:`, data.sessionId);
        
        // Store session ID in localStorage for recovery
        localStorage.setItem('pending_payment_session', JSON.stringify({
          sessionId: data.sessionId,
          momentId,
          timestamp: Date.now()
        }));
        
        // Open Stripe checkout in same tab for better UX
        window.location.href = data.url;
        
        return {
          url: data.url,
          sessionId: data.sessionId,
          feeBreakdown: data.feeBreakdown
        };
      }

      throw new Error('Nessun URL di pagamento ricevuto');
    } catch (error) {
      console.error(`🎫 [TICKET] Purchase error (attempt ${retryCount + 1}):`, error);
      
      // Retry logic for network errors
      if (retryCount < 2 && (error instanceof Error && 
          (error.message.includes('network') || error.message.includes('timeout')))) {
        console.log(`🎫 [TICKET] Retrying payment creation...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return purchaseTicket(momentId, retryCount + 1);
      }
      
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

  // Verify payment status with automatic recovery
  const verifyPayment = useCallback(async (sessionId: string): Promise<{ success: boolean; status: string; participationConfirmed?: boolean } | null> => {
    if (!user) return null;

    try {
      console.log(`🎫 [VERIFY] Verifying payment session: ${sessionId}`);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId }
      });

      if (error) {
        console.error(`🎫 [VERIFY] Error from edge function:`, error);
        throw new Error(error.message || 'Errore nella verifica del pagamento');
      }

      console.log(`🎫 [VERIFY] Verification result:`, data);

      if (data?.success && data?.participationConfirmed) {
        // Clear pending session from localStorage
        localStorage.removeItem('pending_payment_session');
        
        toast({
          title: "Pagamento completato!",
          description: "La tua partecipazione è stata confermata",
          variant: "default"
        });
      } else if (data?.status === 'unpaid' || data?.status === 'canceled') {
        // Clear pending session if payment failed/canceled
        localStorage.removeItem('pending_payment_session');
        
        toast({
          title: "Pagamento non completato",
          description: "Il pagamento non è stato completato. Puoi riprovare quando vuoi.",
          variant: "destructive"
        });
      } else if (data?.status === 'pending') {
        toast({
          title: "Pagamento in elaborazione",
          description: "Il pagamento è ancora in elaborazione. Ricontrolla tra qualche minuto.",
          variant: "default"
        });
      }

      return data;
    } catch (error) {
      console.error(`🎫 [VERIFY] Verification error:`, error);
      toast({
        title: "Errore verifica pagamento",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  // Check for pending payments on load
  const checkPendingPayments = useCallback(async () => {
    if (!user) return;

    const pendingSessionStr = localStorage.getItem('pending_payment_session');
    if (!pendingSessionStr) return;

    try {
      const pendingSession = JSON.parse(pendingSessionStr);
      const { sessionId, timestamp } = pendingSession;
      
      // Only check sessions from last 24 hours
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pending_payment_session');
        return;
      }

      console.log(`🎫 [RECOVERY] Checking pending payment session: ${sessionId}`);
      await verifyPayment(sessionId);
    } catch (error) {
      console.error(`🎫 [RECOVERY] Error checking pending payment:`, error);
      localStorage.removeItem('pending_payment_session');
    }
  }, [user, verifyPayment]);

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
    checkPendingPayments,
    isLoading
  };
}