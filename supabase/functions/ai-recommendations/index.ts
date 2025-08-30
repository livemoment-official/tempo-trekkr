import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { type = 'friends' } = await req.json();

    let recommendations = [];

    if (type === 'friends') {
      // Get user profile for interests and location
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('interests, location, mood')
        .eq('id', user.id)
        .single();

      // Find users with similar interests and nearby location
      const { data: similarUsers } = await supabaseClient
        .from('profiles')
        .select('id, name, username, avatar_url, interests, location, mood')
        .neq('id', user.id)
        .limit(10);

      if (similarUsers && profile) {
        recommendations = similarUsers
          .filter(u => {
            // Filter users with similar interests
            const commonInterests = profile.interests?.filter(interest => 
              u.interests?.includes(interest)
            )?.length || 0;
            return commonInterests > 0;
          })
          .map(u => ({
            ...u,
            recommendation_score: Math.random() * 100, // Simple scoring
            reason: 'Interessi comuni'
          }))
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, 5);
      }
    } else if (type === 'moments') {
      // Get user's interests and location
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('interests, location')
        .eq('id', user.id)
        .single();

      // Find relevant moments
      const { data: moments } = await supabaseClient
        .from('moments')
        .select('*, profiles!host_id(name, username, avatar_url)')
        .eq('is_public', true)
        .gte('when_at', new Date().toISOString())
        .neq('host_id', user.id)
        .limit(10);

      if (moments && profile) {
        recommendations = moments
          .filter(m => {
            // Filter moments with relevant tags
            const relevantTags = m.tags?.filter(tag => 
              profile.interests?.includes(tag)
            )?.length || 0;
            return relevantTags > 0 || Math.random() > 0.7; // Some randomness
          })
          .map(m => ({
            ...m,
            recommendation_score: Math.random() * 100,
            reason: 'Basato sui tuoi interessi'
          }))
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, 5);
      }
    }

    // Use OpenAI for enhanced recommendations if available
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (openAIKey && recommendations.length > 0) {
      try {
        const prompt = `Based on this user data, enhance these ${type} recommendations with better reasoning. 
        User interests: ${profile?.interests?.join(', ') || 'unknown'}
        Recommendations: ${JSON.stringify(recommendations.slice(0, 3))}
        
        Provide enhanced reasons in Italian for why each recommendation is good.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a social app recommendation system. Provide brief, friendly reasons in Italian for recommendations.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const aiData = await response.json();
          const enhancedReasons = aiData.choices[0].message.content;
          console.log('AI enhanced recommendations:', enhancedReasons);
        }
      } catch (error) {
        console.error('Error enhancing with AI:', error);
      }
    }

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});