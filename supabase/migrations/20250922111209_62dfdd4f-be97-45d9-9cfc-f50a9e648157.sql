-- Create junction tables for event-artist and event-venue relationships with status tracking
CREATE TABLE public.event_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'confirmed')),
  invitation_message TEXT,
  response_message TEXT,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, artist_id)
);

CREATE TABLE public.event_venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'contacted' CHECK (status IN ('contacted', 'interested', 'confirmed', 'declined')),
  contact_message TEXT,
  response_message TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, venue_id)
);

-- Enable RLS
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_venues ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_artists
CREATE POLICY "Event hosts can manage their event artists"
ON public.event_artists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_artists.event_id 
    AND events.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_artists.event_id 
    AND events.host_id = auth.uid()
  )
);

CREATE POLICY "Artists can view and update their invitations"
ON public.event_artists
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.id = event_artists.artist_id 
    AND artists.user_id = auth.uid()
  )
);

CREATE POLICY "Artists can update their invitation status"
ON public.event_artists
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.artists 
    WHERE artists.id = event_artists.artist_id 
    AND artists.user_id = auth.uid()
  )
);

-- RLS policies for event_venues  
CREATE POLICY "Event hosts can manage their event venues"
ON public.event_venues
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_venues.event_id 
    AND events.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_venues.event_id 
    AND events.host_id = auth.uid()
  )
);

CREATE POLICY "Venue owners can view and update their invitations"
ON public.event_venues
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = event_venues.venue_id 
    AND venues.user_id = auth.uid()
  )
);

CREATE POLICY "Venue owners can update their invitation status"
ON public.event_venues
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = event_venues.venue_id 
    AND venues.user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_event_artists_updated_at
  BEFORE UPDATE ON public.event_artists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_event_venues_updated_at
  BEFORE UPDATE ON public.event_venues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();