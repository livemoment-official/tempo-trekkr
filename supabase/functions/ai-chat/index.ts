import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { message, context } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Non autorizzato');
    }

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('name, interests, mood, job_title, bio')
      .eq('id', user.id)
      .single();

    // Get recent moments for context (if requested)
    let recentMoments = [];
    if (context?.includeMoments) {
      const { data: moments } = await supabaseClient
        .from('moments')
        .select('title, description, tags, created_at')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      recentMoments = moments || [];
    }

    // Prepare context for AI
    const contextPrompt = `
Sei un assistente AI personale per LiveMoment, un'app social italiana per incontrare persone e condividere momenti.

Informazioni utente:
- Nome: ${profile?.name || 'Utente'}
- Interessi: ${profile?.interests?.join(', ') || 'Non specificati'}
- Mood: ${profile?.mood || 'Non specificato'}
- Lavoro: ${profile?.job_title || 'Non specificato'}
- Bio: ${profile?.bio || 'Non specificata'}

${recentMoments.length > 0 ? `
Momenti recenti dell'utente:
${recentMoments.map(m => `- ${m.title}: ${m.description}`).join('\n')}
` : ''}

Rispondi sempre in italiano in modo amichevole e utile. Aiuta l'utente con:
- Suggerimenti per creare momenti interessanti
- Consigli per socializzare
- Idee per attività basate sui suoi interessi
- Supporto generale per l'uso dell'app
`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: contextPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIData.error?.message || 'Unknown error'}`);
    }

    const aiMessage = openAIData.choices[0].message.content;

    // Log the interaction (optional)
    await supabaseClient
      .from('user_analytics')
      .insert({
        user_id: user.id,
        event_type: 'ai_chat',
        event_data: {
          message: message.substring(0, 100), // Only log first 100 chars for privacy
          response_length: aiMessage.length
        }
      });

    return new Response(JSON.stringify({ 
      message: aiMessage,
      context: {
        userName: profile?.name,
        userInterests: profile?.interests
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Errore interno del server' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});