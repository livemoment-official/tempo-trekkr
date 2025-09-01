import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationPayload {
  userId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-PUSH-NOTIFICATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { userId, title, message, data }: PushNotificationPayload = await req.json();

    if (!userId || !title || !message) {
      throw new Error("userId, title, and message are required");
    }

    logStep("Processing notification", { userId, title });

    // Get user's device tokens
    const { data: deviceTokens, error: tokensError } = await supabaseClient
      .from('device_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (tokensError) {
      throw new Error(`Error fetching device tokens: ${tokensError.message}`);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      logStep("No device tokens found for user", { userId });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No devices to notify" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found device tokens", { count: deviceTokens.length });

    // Create notification record in database
    const { error: notificationError } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: data?.type || 'general',
        title,
        message,
        data: data || {}
      });

    if (notificationError) {
      logStep("Warning: Failed to create notification record", notificationError);
    }

    // For web push notifications, we would need to implement Web Push Protocol
    // This is a simplified version that logs the notification
    // In a real implementation, you would:
    // 1. Use a library like 'web-push' to send actual push notifications
    // 2. Handle different platforms (web, iOS, Android) differently
    // 3. Manage VAPID keys securely

    const results = await Promise.allSettled(
      deviceTokens.map(async (deviceToken) => {
        try {
          // This is where you would send the actual push notification
          // For now, we'll just log it
          logStep("Would send push notification", {
            platform: deviceToken.platform,
            title,
            message,
            data
          });

          // Simulate successful delivery
          return { success: true, platform: deviceToken.platform };
        } catch (error) {
          logStep("Error sending to device", { 
            platform: deviceToken.platform, 
            error: error instanceof Error ? error.message : String(error) 
          });
          return { success: false, platform: deviceToken.platform, error };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    logStep("Push notification results", { successful, failed, total: results.length });

    return new Response(JSON.stringify({ 
      success: true,
      delivered: successful,
      failed: failed,
      total: results.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-push-notification", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});