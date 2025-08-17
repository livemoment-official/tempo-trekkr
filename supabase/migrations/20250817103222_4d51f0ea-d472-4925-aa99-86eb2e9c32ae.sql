-- Fix notifications system and add test data

-- Add related_id column if it doesn't exist
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS related_id UUID;

-- Create function to create invite notifications
CREATE OR REPLACE FUNCTION create_invite_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for each participant
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  SELECT 
    unnest(NEW.participants),
    'Nuovo invito ricevuto',
    'Hai ricevuto un invito per: ' || NEW.title,
    'invite_received',
    NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Create trigger for invite notifications
DROP TRIGGER IF EXISTS trigger_invite_notifications ON public.invites;
CREATE TRIGGER trigger_invite_notifications
  AFTER INSERT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION create_invite_notifications();

-- Insert test profiles (using correct column names)
INSERT INTO public.profiles (id, name, username, avatar_url, interests, mood, job_title, location, privacy_level)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Sofia Rossi',
    'sofia_music',
    null,
    ARRAY['musica', 'aperitivo', 'arte'],
    'chill',
    'Musicista',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb,
    'public'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Marco Bianchi',
    'marco_artist',
    null,
    ARRAY['arte', 'fotografia', 'concerti'],
    'energico',
    'Artista',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb,
    'public'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Giulia Verdi',
    'giulia_food',
    null,
    ARRAY['cucina', 'wine', 'eventi'],
    'socievole',
    'Chef',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb,
    'public'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Andrea Neri',
    'andrea_live',
    null,
    ARRAY['live', 'dj', 'festival'],
    'creativo',
    'DJ',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb,
    'public'
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  privacy_level = 'public';

-- Insert test availability data
INSERT INTO public.availability (user_id, start_at, end_at, is_on, shareable)
VALUES 
  ('11111111-1111-1111-1111-111111111111', now(), now() + interval '4 hours', true, true),
  ('22222222-2222-2222-2222-222222222222', now(), now() + interval '3 hours', true, true),
  ('33333333-3333-3333-3333-333333333333', now(), now() + interval '5 hours', true, true),
  ('44444444-4444-4444-4444-444444444444', now(), now() + interval '6 hours', true, true);