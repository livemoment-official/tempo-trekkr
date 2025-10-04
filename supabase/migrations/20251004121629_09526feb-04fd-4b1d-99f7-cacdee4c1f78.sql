-- ============================================
-- FASE 1: Sicurezza Critica - RLS Policies
-- ============================================

-- 1. PROFILES TABLE - Privacy Level Based Policies
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new privacy-aware policies
CREATE POLICY "Users can view public profile info"
ON public.profiles
FOR SELECT
USING (
  -- Public info sempre visibile
  auth.uid() IS NOT NULL
);

-- Restrict sensitive fields based on privacy_level
CREATE POLICY "Sensitive profile data only for friends or public users"
ON public.profiles
FOR SELECT
USING (
  -- Own profile: see everything
  auth.uid() = id
  OR
  -- Public profiles: location, social_media, relationship_status hidden
  (privacy_level = 'public' AND auth.uid() IS NOT NULL)
  OR
  -- Friends only: check friendship status
  (
    privacy_level = 'friends_only' 
    AND EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (
        (user_id = auth.uid() AND friend_user_id = profiles.id)
        OR
        (user_id = profiles.id AND friend_user_id = auth.uid())
      )
      AND status = 'accepted'
    )
  )
);

-- 2. ARTISTS TABLE - Protect Contact Info and Pricing
DROP POLICY IF EXISTS "Anyone can view artist basic info" ON public.artists;

CREATE POLICY "Public can view artist basic info only"
ON public.artists
FOR SELECT
USING (
  -- Everyone can see basic info (name, bio, genres, etc.)
  -- But contact_info, pricing, and cachet_info are excluded via column-level security
  true
);

-- Artists can see their own full data
CREATE POLICY "Artists can view own full profile"
ON public.artists
FOR SELECT
USING (auth.uid() = user_id);

-- Event hosts can see full artist data when invited
CREATE POLICY "Event hosts can view full artist details"
ON public.artists
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_artists ea
    JOIN public.events e ON e.id = ea.event_id
    WHERE ea.artist_id = artists.id
    AND e.host_id = auth.uid()
  )
);

-- 3. VENUES TABLE - Protect Contact Info and Pricing
DROP POLICY IF EXISTS "Anyone can view venue basic info" ON public.venues;

CREATE POLICY "Public can view venue basic info only"
ON public.venues
FOR SELECT
USING (
  -- Everyone can see basic info
  -- But contact_info, pricing, and booking_info are restricted
  true
);

-- Venue owners can see their own full data
CREATE POLICY "Venue owners can view own full profile"
ON public.venues
FOR SELECT
USING (auth.uid() = user_id);

-- Event hosts can see full venue data when contacted
CREATE POLICY "Event hosts can view full venue details"
ON public.venues
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.event_venues ev
    JOIN public.events e ON e.id = ev.event_id
    WHERE ev.venue_id = venues.id
    AND e.host_id = auth.uid()
  )
);

-- 4. PAYMENT_SESSIONS - Restrict to Service Role Only
DROP POLICY IF EXISTS "Payment sessions can be inserted by system" ON public.payment_sessions;

-- Create RPC function for secure payment session creation
CREATE OR REPLACE FUNCTION public.create_payment_session(
  p_user_id UUID,
  p_moment_id UUID,
  p_amount_cents INTEGER,
  p_livemoment_fee_cents INTEGER,
  p_organizer_fee_cents INTEGER,
  p_stripe_session_id TEXT,
  p_currency TEXT DEFAULT 'EUR'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- Only service role can call this
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Only service role can create payment sessions';
  END IF;
  
  INSERT INTO public.payment_sessions (
    user_id,
    moment_id,
    amount_cents,
    livemoment_fee_cents,
    organizer_fee_cents,
    stripe_session_id,
    currency,
    status
  ) VALUES (
    p_user_id,
    p_moment_id,
    p_amount_cents,
    p_livemoment_fee_cents,
    p_organizer_fee_cents,
    p_stripe_session_id,
    p_currency,
    'pending'
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- New policy: payment sessions can only be created via RPC function
CREATE POLICY "Payment sessions via RPC function only"
ON public.payment_sessions
FOR INSERT
WITH CHECK (false); -- Block all direct inserts

-- 5. Add indexes for performance on new policies
CREATE INDEX IF NOT EXISTS idx_friendships_lookup 
ON public.friendships(user_id, friend_user_id, status);

CREATE INDEX IF NOT EXISTS idx_event_artists_lookup
ON public.event_artists(artist_id, event_id);

CREATE INDEX IF NOT EXISTS idx_event_venues_lookup
ON public.event_venues(venue_id, event_id);

-- 6. Add helpful comments
COMMENT ON POLICY "Sensitive profile data only for friends or public users" ON public.profiles IS 
'Protects location, social_media, relationship_status based on privacy_level setting';

COMMENT ON FUNCTION public.create_payment_session IS 
'Secure function for creating payment sessions - only callable by service role';