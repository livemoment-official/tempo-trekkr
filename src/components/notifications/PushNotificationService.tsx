import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Service Worker registration and push notification setup
export function PushNotificationService() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initializePushNotifications = async () => {
      try {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          console.log('Service Worker not supported');
          return;
        }

        // Check if push notifications are supported
        if (!('PushManager' in window)) {
          console.log('Push messaging not supported');
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', registration);

        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        if (permission === 'granted') {
          // Subscribe to push notifications
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: await getVAPIDPublicKey()
          });

          // Save the subscription to the database
          await saveSubscription(subscription);
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    initializePushNotifications();
  }, [user]);

  const getVAPIDPublicKey = async (): Promise<Uint8Array> => {
    // This would typically come from your server/environment
    // For now, return a placeholder - you'll need to generate VAPID keys
    const vapidPublicKey = 'BLc4xRzKlKORKWlbdgFaBkabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const padding = '='.repeat((4 - vapidPublicKey.length % 4) % 4);
    const base64 = (vapidPublicKey + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const saveSubscription = async (subscription: PushSubscription) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token: JSON.stringify(subscription),
          platform: 'web'
        }, {
          onConflict: 'user_id,token'
        });

      if (error) {
        console.error('Error saving push subscription:', error);
      } else {
        console.log('Push subscription saved successfully');
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
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
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo.png',
              tag: notification.id,
              data: notification.data
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // This component doesn't render anything
  return null;
}