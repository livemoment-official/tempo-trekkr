-- Estendere tabella invites per supportare il nuovo sistema
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS invite_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS can_be_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS response_message TEXT,
ADD COLUMN IF NOT EXISTS location_radius INTEGER DEFAULT 5000; -- in metri

-- Aggiungere constraint per limitare invite_count a massimo 3
ALTER TABLE public.invites 
ADD CONSTRAINT check_invite_count CHECK (invite_count <= 3 AND invite_count >= 1);

-- Creare funzione per calcolare la distanza tra due punti (formula Haversine)
CREATE OR REPLACE FUNCTION public.calculate_distance_km(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT 
    6371 * acos(
      cos(radians(lat1)) * cos(radians(lat2)) * 
      cos(radians(lng2) - radians(lng1)) + 
      sin(radians(lat1)) * sin(radians(lat2))
    );
$$;

-- Creare funzione per trovare utenti disponibili nelle vicinanze
CREATE OR REPLACE FUNCTION public.get_nearby_available_users(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 5.0,
  target_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  mood TEXT,
  distance_km DOUBLE PRECISION,
  availability_id UUID,
  job_title TEXT,
  interests TEXT[]
) 
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT
    p.id as user_id,
    p.name,
    p.username,
    p.avatar_url,
    p.mood,
    calculate_distance_km(
      user_lat, user_lng,
      CAST(p.location->>'lat' AS DOUBLE PRECISION),
      CAST(p.location->>'lng' AS DOUBLE PRECISION)
    ) as distance_km,
    a.id as availability_id,
    p.job_title,
    p.interests
  FROM profiles p
  JOIN availability a ON a.user_id = p.id
  WHERE 
    p.id != auth.uid()
    AND a.is_on = true 
    AND a.shareable = true
    AND (a.end_at IS NULL OR a.end_at >= target_time)
    AND (a.start_at IS NULL OR a.start_at <= target_time)
    AND p.location IS NOT NULL
    AND p.location->>'lat' IS NOT NULL
    AND p.location->>'lng' IS NOT NULL
    AND calculate_distance_km(
      user_lat, user_lng,
      CAST(p.location->>'lat' AS DOUBLE PRECISION),
      CAST(p.location->>'lng' AS DOUBLE PRECISION)
    ) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 50;
$$;

-- Creare funzione per contare inviti esistenti verso un utente
CREATE OR REPLACE FUNCTION public.count_user_invites_today(
  target_user_id UUID,
  inviter_id UUID DEFAULT auth.uid()
)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(invite_count), 0)
  FROM invites
  WHERE host_id = inviter_id
    AND target_user_id = ANY(participants)
    AND created_at >= CURRENT_DATE
    AND status != 'rejected';
$$;