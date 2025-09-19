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
        message: "AI non ancora configurata. Intanto ecco alcune idee: guarda persone disponibili ora ed eventi consigliati sotto. [TrovaAmici] [Eventi]" 
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
      availableUsers: { 
        count: availableNow.data?.length || 0,
        samples: availableNow.data?.slice(0, 3).map(u => ({ 
          name: u.name, 
          mood: u.mood, 
          job_title: u.job_title 
        })) || []
      },
      events: { 
        count: events.data?.length || 0,
        samples: events.data?.slice(0, 3).map(e => ({ 
          title: e.title, 
          place: e.place,
          when_at: e.when_at 
        })) || []
      },
      moments: { 
        count: moments.data?.length || 0,
        samples: moments.data?.slice(0, 3).map(m => ({ 
          title: m.title, 
          tags: m.tags,
          when_at: m.when_at 
        })) || []
      }
    };

    // Create system prompt with context and navigation links
    const systemPrompt = `Sei un assistente AI esperto nel consigliare esperienze sociali e culturali. 

Contesto attuale della piattaforma:
- Persone disponibili: ${contextData.availableUsers.count}
- Eventi in corso: ${contextData.events.count}  
- Momenti condivisi: ${contextData.moments.count}

Esempi di contenuti disponibili:
${contextData.availableUsers.samples.length > 0 ? 'Utenti disponibili:\n' + contextData.availableUsers.samples.map(u => `- ${u.name} (${u.mood}) - ${u.job_title}`).join('\n') : ''}

${contextData.events.samples.length > 0 ? 'Eventi in programma:\n' + contextData.events.samples.map(e => `- ${e.title} - ${e.place?.name || 'Location TBD'}`).join('\n') : ''}

${contextData.moments.samples.length > 0 ? 'Momenti recenti:\n' + contextData.moments.samples.map(m => `- ${m.title} - ${m.tags?.join(', ') || ''}`).join('\n') : ''}

IMPORTANTE: Quando suggerisci azioni specifiche, includi nella risposta i link appropriati usando questi tag:
- [Inviti] per creare inviti o cercare persone
- [Eventi] per partecipare agli eventi
- [Momenti] per esplorare momenti condivisi
- [Profili] per scoprire artisti e professionisti
- [TrovaAmici] per trovare nuove persone

Le tue risposte devono essere:
- Brevi e coinvolgenti (max 150 parole)
- Specifiche e actionable
- Focalizzate su esperienze reali disponibili sulla piattaforma
- In italiano casual e amichevole
- Includere sempre almeno un link di navigazione pertinente`;

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
    const message = data.choices[0].message.content;

    console.log('AI response generated successfully');
    
    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-explore function:', error);
    return new Response(JSON.stringify({ 
      message: "Scusa, c'è stato un errore. Prova a guardare le persone disponibili e gli eventi sotto! [TrovaAmici] [Eventi]"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});