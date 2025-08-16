-- Estendere tabella invites per supportare il nuovo sistema
ALTER TABLE public.invites 
ADD COLUMN invite_count INTEGER DEFAULT 1,
ADD COLUMN can_be_public BOOLEAN DEFAULT false,
ADD COLUMN response_message TEXT,
ADD COLUMN location_radius INTEGER DEFAULT 5000; -- in metri

-- Aggiornare enum per stati inviti più dettagliati
ALTER TABLE public.invites 
ALTER COLUMN status TYPE TEXT;

-- Aggiungere constraint per limitare invite_count a massimo 3
ALTER TABLE public.invites 
ADD CONSTRAINT check_invite_count CHECK (invite_count <= 3 AND invite_count >= 1);

-- Creare funzione per trovare utenti disponibili nelle vicinanze
CREATE OR REPLACE FUNCTION public.get_nearby_available_users(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  target_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  username TEXT,
  avatar_url TEXT,
  mood TEXT,
  distance_meters INTEGER,
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
    CAST(
      ST_Distance(
        ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
        ST_GeogFromText('POINT(' || 
          CAST(p.location->>'lng' AS DOUBLE PRECISION) || ' ' || 
          CAST(p.location->>'lat' AS DOUBLE PRECISION) || ')')
      ) AS INTEGER
    ) as distance_meters,
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
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      ST_GeogFromText('POINT(' || 
        CAST(p.location->>'lng' AS DOUBLE PRECISION) || ' ' || 
        CAST(p.location->>'lat' AS DOUBLE PRECISION) || ')'),
      radius_meters
    )
  ORDER BY distance_meters ASC
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

-- Creare trigger per aggiornare updated_at su invites
CREATE TRIGGER update_invites_updated_at
  BEFORE UPDATE ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Aggiungere RLS policy per le nuove funzioni
CREATE POLICY "Users can call nearby users function"
  ON public.profiles
  FOR SELECT
  USING (true); -- Permesso pubblico per la ricerca geografica

-- Aggiungere estensione PostGIS se non esiste
CREATE EXTENSION IF NOT EXISTS postgis;