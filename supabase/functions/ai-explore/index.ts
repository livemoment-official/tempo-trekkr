import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        reply: "AI non ancora configurata. Intanto ecco alcune idee: guarda persone disponibili ora ed eventi consigliati sotto." 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current context data for recommendations
    const [availableNow, events, moments] = await Promise.all([
      supabase.from("available_now").select("*").limit(5),
      supabase.from("events").select("*").eq("discovery_on", true).limit(5),
      supabase.from("moments").select("*").eq("is_public", true).limit(5)
    ]);

    // Build context for AI
    const contextData = {
      availablePeople: availableNow.data?.length || 0,
      upcomingEvents: events.data?.length || 0,
      publicMoments: moments.data?.length || 0,
      sampleEvents: events.data?.slice(0, 2).map(e => ({ title: e.title, when: e.when_at })) || [],
      sampleMoments: moments.data?.slice(0, 2).map(m => ({ title: m.title, when: m.when_at })) || []
    };

    const systemPrompt = `Sei un assistente AI per LiveMoment, un'app social per organizzare incontri spontanei.

Contesto attuale:
- ${contextData.availablePeople} persone disponibili ora
- ${contextData.upcomingEvents} eventi in zona
- ${contextData.publicMoments} momenti pubblici

Eventi esempio: ${contextData.sampleEvents.map(e => e.title).join(', ')}
Momenti esempio: ${contextData.sampleMoments.map(m => m.title).join(', ')}

Rispondi in italiano, sii conciso e suggerisci attività concrete basate sui dati disponibili. Incoraggia l'utente a esplorare le sezioni sotto per vedere persone disponibili, eventi e momenti.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    console.log('AI response generated successfully');
    
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-explore function:', error);
    return new Response(JSON.stringify({ 
      reply: "Scusa, c'è stato un errore. Prova a guardare le persone disponibili e gli eventi sotto!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});