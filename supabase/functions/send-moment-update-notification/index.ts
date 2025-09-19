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
    const { momentId, updateMessage } = await req.json();

    if (!momentId) {
      throw new Error('momentId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get moment details and participants
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .select('title, host_id, participants')
      .eq('id', momentId)
      .single();

    if (momentError) {
      console.error('Error fetching moment:', momentError);
      throw momentError;
    }

    if (!moment.participants || moment.participants.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No participants to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notifications for all participants (excluding host)
    const participantsToNotify = moment.participants.filter(
      (participantId: string) => participantId !== moment.host_id
    );

    if (participantsToNotify.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No participants to notify (excluding host)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert notifications
    const notifications = participantsToNotify.map((participantId: string) => ({
      user_id: participantId,
      type: 'moment_update',
      title: 'Momento aggiornato',
      message: updateMessage || `Il momento "${moment.title}" è stato aggiornato`,
      data: {
        moment_id: momentId,
        moment_title: moment.title
      }
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      throw notificationError;
    }

    console.log(`Created ${notifications.length} notifications for moment ${momentId}`);

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent successfully',
        count: notifications.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-moment-update-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});