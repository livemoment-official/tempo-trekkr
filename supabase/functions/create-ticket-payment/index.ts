import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-TICKET-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with service role key for secure operations
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
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { momentId } = await req.json();
    if (!momentId) throw new Error("momentId is required");

    // Get moment details and pricing
    const { data: moment, error: momentError } = await supabaseClient
      .from('moments')
      .select('*')
      .eq('id', momentId)
      .single();

    if (momentError) throw new Error(`Error fetching moment: ${momentError.message}`);
    if (!moment.payment_required) throw new Error("This moment does not require payment");

    logStep("Moment details retrieved", { 
      title: moment.title, 
      price: moment.price_cents,
      currency: moment.currency 
    });

    // Check if user is already a participant
    const { data: existingParticipant } = await supabaseClient
      .from('moment_participants')
      .select('id')
      .eq('moment_id', momentId)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      throw new Error("You are already registered for this moment");
    }

    // Check if moment is full
    const { data: participants } = await supabaseClient
      .from('moment_participants')
      .select('id')
      .eq('moment_id', momentId);

    if (moment.max_participants && participants && participants.length >= moment.max_participants) {
      throw new Error("This moment is full");
    }

    // Calculate fees (fees are included in the base price, not added on top)
    const basePrice = moment.price_cents;
    const livemomentFee = Math.round(basePrice * (moment.livemoment_fee_percentage / 100));
    const organizerFee = basePrice - livemomentFee;

    logStep("Fee calculation", {
      basePrice,
      livemomentFee,
      organizerFee,
      totalAmount: basePrice
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: moment.currency.toLowerCase(),
            product_data: { 
              name: `Biglietto - ${moment.title}`,
              description: `Partecipazione al momento: ${moment.title}`,
              metadata: {
                moment_id: momentId,
                user_id: user.id
              }
            },
            unit_amount: basePrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/moment/${momentId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/moment/${momentId}?payment=cancelled`,
      metadata: {
        moment_id: momentId,
        user_id: user.id,
        base_price: basePrice.toString(),
        livemoment_fee: livemomentFee.toString(),
        organizer_fee: organizerFee.toString()
      }
    });

    logStep("Stripe session created", { sessionId: session.id, url: session.url });

    // Record payment session in database
    const { error: sessionError } = await supabaseClient
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        moment_id: momentId,
        stripe_session_id: session.id,
        amount_cents: basePrice,
        currency: moment.currency,
        livemoment_fee_cents: livemomentFee,
        organizer_fee_cents: organizerFee,
        status: 'pending'
      });

    if (sessionError) {
      logStep("Warning: Failed to record payment session", sessionError);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      feeBreakdown: {
        basePrice,
        livemomentFee,
        organizerFee,
        totalAmount: basePrice,
        currency: moment.currency
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-ticket-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});