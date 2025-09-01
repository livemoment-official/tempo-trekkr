import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Send push notification to a user
  const sendNotification = useCallback(async (
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title,
          message,
          data
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to send notification');
      }

      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      toast({
        title: "Errore notifica",
        description: error instanceof Error ? error.message : "Errore sconosciuto",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Send notification to moment participants
  const notifyMomentParticipants = useCallback(async (
    momentId: string,
    title: string,
    message: string,
    excludeUserId?: string
  ) => {
    try {
      // Get moment participants
      const { data: participants, error } = await supabase
        .from('moment_participants')
        .select('user_id')
        .eq('moment_id', momentId)
        .neq('user_id', excludeUserId || '');

      if (error) throw error;

      if (participants && participants.length > 0) {
        // Send notifications to all participants
        const promises = participants.map(p => 
          sendNotification(p.user_id, title, message, { 
            type: 'moment_update', 
            moment_id: momentId 
          })
        );

        await Promise.all(promises);
        return participants.length;
      }

      return 0;
    } catch (error) {
      console.error('Error notifying moment participants:', error);
      return 0;
    }
  }, [sendNotification]);

  // Send notification for new payment
  const notifyPaymentReceived = useCallback(async (
    organizerId: string,
    momentTitle: string,
    amount: number,
    currency: string
  ) => {
    const formattedAmount = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);

    await sendNotification(
      organizerId,
      'Pagamento ricevuto! 💰',
      `Hai ricevuto un pagamento di ${formattedAmount} per "${momentTitle}"`,
      {
        type: 'payment_received',
        amount,
        currency
      }
    );
  }, [sendNotification]);

  // Send notification for new participant
  const notifyNewParticipant = useCallback(async (
    organizerId: string,
    momentTitle: string,
    participantName: string
  ) => {
    await sendNotification(
      organizerId,
      'Nuovo partecipante! 🎉',
      `${participantName} si è unito a "${momentTitle}"`,
      {
        type: 'new_participant'
      }
    );
  }, [sendNotification]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new;
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000
          });

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo.png',
              tag: notification.id
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return {
    sendNotification,
    notifyMomentParticipants,
    notifyPaymentReceived,
    notifyNewParticipant
  };
}