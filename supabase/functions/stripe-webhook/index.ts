import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseClient);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseClient);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object, supabaseClient);
        break;
        
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object, supabaseClient);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseClient: any) {
  logStep("Handling checkout completed", { sessionId: session.id });
  
  const momentId = session.metadata?.moment_id;
  const userId = session.metadata?.user_id;
  
  if (!momentId || !userId) {
    logStep("Missing metadata in session", { momentId, userId });
    return;
  }

  // Update payment session status
  const { error: sessionError } = await supabaseClient
    .from('payment_sessions')
    .update({ status: 'completed' })
    .eq('stripe_session_id', session.id);

  if (sessionError) {
    logStep("Error updating payment session", sessionError);
  }

  // Check if participant already exists
  const { data: existingParticipant } = await supabaseClient
    .from('moment_participants')
    .select('id')
    .eq('moment_id', momentId)
    .eq('user_id', userId)
    .single();

  if (!existingParticipant) {
    // Add participant
    const { error: participantError } = await supabaseClient
      .from('moment_participants')
      .insert({
        moment_id: momentId,
        user_id: userId,
        status: 'confirmed',
        payment_status: 'paid',
        stripe_payment_id: session.payment_intent,
        amount_paid_cents: parseInt(session.metadata?.base_price || '0'),
        livemoment_fee_cents: parseInt(session.metadata?.livemoment_fee || '0'),
        organizer_fee_cents: parseInt(session.metadata?.organizer_fee || '0'),
        currency: 'EUR',
        stripe_session_id: session.id
      });

    if (participantError) {
      logStep("Error adding participant", participantError);
    } else {
      logStep("Participant added successfully", { momentId, userId });
      
      // Send success notification
      await sendPaymentNotification(momentId, userId, 'success', supabaseClient);
    }
  }
}

async function handlePaymentSucceeded(paymentIntent: any, supabaseClient: any) {
  logStep("Handling payment succeeded", { paymentIntentId: paymentIntent.id });
  
  // Update any related payment sessions
  const { error } = await supabaseClient
    .from('payment_sessions')
    .update({ status: 'completed' })
    .eq('stripe_session_id', paymentIntent.id);

  if (error) {
    logStep("Error updating payment session for payment intent", error);
  }
}

async function handlePaymentFailed(paymentIntent: any, supabaseClient: any) {
  logStep("Handling payment failed", { paymentIntentId: paymentIntent.id });
  
  // Update payment session status
  const { error } = await supabaseClient
    .from('payment_sessions')
    .update({ status: 'failed' })
    .eq('stripe_session_id', paymentIntent.id);

  if (error) {
    logStep("Error updating payment session for failed payment", error);
  }
}

async function handleCheckoutExpired(session: any, supabaseClient: any) {
  logStep("Handling checkout expired", { sessionId: session.id });
  
  // Update payment session status
  const { error } = await supabaseClient
    .from('payment_sessions')
    .update({ status: 'expired' })
    .eq('stripe_session_id', session.id);

  if (error) {
    logStep("Error updating expired session", error);
  }
}

async function sendPaymentNotification(momentId: string, userId: string, type: 'success' | 'failed', supabaseClient: any) {
  try {
    const { data: moment } = await supabaseClient
      .from('moments')
      .select('host_id, title')
      .eq('id', momentId)
      .single();

    if (moment) {
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: moment.host_id,
          type: type === 'success' ? 'payment_received' : 'payment_failed',
          title: type === 'success' ? 'Pagamento ricevuto!' : 'Pagamento fallito',
          message: type === 'success' 
            ? `Hai ricevuto un pagamento per "${moment.title}"`
            : `Un pagamento per "${moment.title}" è fallito`,
          data: {
            moment_id: momentId,
            participant_id: userId
          }
        });
    }
  } catch (error) {
    logStep("Error sending notification", error);
  }
}