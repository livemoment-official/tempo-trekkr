import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, type, title, message, data } = await req.json();

    if (!userId || !type || !title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create notification in database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || {},
        read: false
      });

    if (notificationError) {
      throw notificationError;
    }

    // Here you could integrate with push notification services like:
    // - Firebase Cloud Messaging
    // - Apple Push Notification Service
    // - Web Push API
    // For now, we'll just log the notification
    console.log('Push notification sent:', {
      userId,
      type,
      title,
      message,
      data
    });

    // In a real implementation, you would send the actual push notification here
    // For example, with Firebase:
    /*
    const fcmToken = Deno.env.get('FCM_SERVER_KEY');
    if (fcmToken) {
      const pushResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${fcmToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: userDeviceToken, // You'd need to store user device tokens
          notification: {
            title,
            body: message,
          },
          data: data || {},
        }),
      });
    }
    */

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});