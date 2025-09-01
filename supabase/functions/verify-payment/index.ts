import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("sessionId is required");

    logStep("Verifying payment session", { sessionId, userId: user.id });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Stripe session retrieved", { 
      status: session.payment_status, 
      customerEmail: session.customer_email 
    });

    if (session.payment_status === 'paid') {
      const momentId = session.metadata?.moment_id;
      const userId = session.metadata?.user_id;

      if (!momentId || userId !== user.id) {
        throw new Error("Invalid session metadata");
      }

      // Check if participant already exists
      const { data: existingParticipant } = await supabaseClient
        .from('moment_participants')
        .select('id')
        .eq('moment_id', momentId)
        .eq('user_id', user.id)
        .single();

      if (!existingParticipant) {
        // Add user as participant
        const { error: participantError } = await supabaseClient
          .from('moment_participants')
          .insert({
            moment_id: momentId,
            user_id: user.id,
            status: 'confirmed',
            payment_status: 'paid',
            stripe_payment_id: session.payment_intent as string,
            amount_paid_cents: parseInt(session.metadata?.base_price || '0'),
            livemoment_fee_cents: parseInt(session.metadata?.livemoment_fee || '0'),
            organizer_fee_cents: parseInt(session.metadata?.organizer_fee || '0'),
            currency: 'EUR',
            stripe_session_id: sessionId
          });

        if (participantError) {
          throw new Error(`Error adding participant: ${participantError.message}`);
        }

        logStep("Participant added successfully", { momentId, userId: user.id });
      }

      // Update payment session status
      const { error: updateError } = await supabaseClient
        .from('payment_sessions')
        .update({ status: 'completed' })
        .eq('stripe_session_id', sessionId);

      if (updateError) {
        logStep("Warning: Failed to update payment session", updateError);
      }

      // Send notification to organizer
      const { data: moment } = await supabaseClient
        .from('moments')
        .select('host_id, title')
        .eq('id', momentId)
        .single();

      if (moment) {
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: moment.host_id,
            type: 'payment_received',
            title: 'Pagamento ricevuto!',
            message: `Hai ricevuto un pagamento per "${moment.title}"`,
            data: {
              moment_id: momentId,
              participant_id: user.id,
              amount: session.metadata?.base_price
            }
          });

        if (notificationError) {
          logStep("Warning: Failed to send notification", notificationError);
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        status: 'paid',
        participationConfirmed: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      // Update payment session status to failed if needed
      const { error: updateError } = await supabaseClient
        .from('payment_sessions')
        .update({ status: session.payment_status === 'unpaid' ? 'failed' : 'pending' })
        .eq('stripe_session_id', sessionId);

      return new Response(JSON.stringify({ 
        success: false, 
        status: session.payment_status 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});