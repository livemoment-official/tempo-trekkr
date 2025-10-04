import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchContactsRequest {
  phoneHashes: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { phoneHashes }: MatchContactsRequest = await req.json();

    if (!phoneHashes || !Array.isArray(phoneHashes) || phoneHashes.length === 0) {
      return new Response(
        JSON.stringify({ matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Matching ${phoneHashes.length} phone hashes for user ${user.id}`);

    // Limit to 500 hashes to prevent abuse
    const limitedHashes = phoneHashes.slice(0, 500);

    // Query profiles table for matching phone_hashes
    // Exclude the current user and users who have phone_discoverable = false
    const { data: matches, error: matchError } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .in('phone_hash', limitedHashes)
      .neq('id', user.id)
      .eq('phone_discoverable', true);

    if (matchError) {
      console.error('Error matching contacts:', matchError);
      throw matchError;
    }

    console.log(`Found ${matches?.length || 0} matching users`);

    // Return matched users (without exposing phone_hash)
    return new Response(
      JSON.stringify({ 
        matches: matches || [],
        total: matches?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in match-phone-contacts:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        matches: []
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
