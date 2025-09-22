import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  eventId: string;
  artistIds: string[];
  venueIds: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, artistIds, venueIds }: NotificationRequest = await req.json();

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    // Send notifications to artists
    if (artistIds.length > 0) {
      // Get artist user IDs
      const { data: artists, error: artistsError } = await supabase
        .from('artists')
        .select('user_id, name')
        .in('id', artistIds);

      if (!artistsError && artists) {
        for (const artist of artists) {
          if (artist.user_id) {
            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: artist.user_id,
                type: 'event_invitation',
                title: 'Invito Evento',
                message: `Sei stato invitato all'evento "${event.title}"`,
                data: {
                  event_id: eventId,
                  event_title: event.title,
                  event_date: event.when_at
                }
              });
          }
        }
      }
    }

    // Send notifications to venues
    if (venueIds.length > 0) {
      // Get venue user IDs
      const { data: venues, error: venuesError } = await supabase
        .from('venues')
        .select('user_id, name')
        .in('id', venueIds);

      if (!venuesError && venues) {
        for (const venue of venues) {
          if (venue.user_id) {
            // Create notification
            await supabase
              .from('notifications')
              .insert({
                user_id: venue.user_id,
                type: 'venue_contact',
                title: 'Richiesta Location',
                message: `La tua location è stata selezionata per l'evento "${event.title}"`,
                data: {
                  event_id: eventId,
                  event_title: event.title,
                  event_date: event.when_at
                }
              });
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Notifications sent successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});