-- Fix InvitePreviewStep UUID handling and add notifications system

-- Create notifications table for invite notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL DEFAULT 'invite_received',
  related_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

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

-- Add sample test profiles for geolocation testing
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test1@example.com', now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'test2@example.com', now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'test3@example.com', now(), now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'test4@example.com', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Add profiles for test users if they don't exist
INSERT INTO public.profiles (id, user_id, display_name, username, avatar_url, interests, mood, job_title, location)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Sofia Rossi',
    'sofia_music',
    null,
    ARRAY['musica', 'aperitivo', 'arte'],
    'chill',
    'Musicista',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Marco Bianchi',
    'marco_artist',
    null,
    ARRAY['arte', 'fotografia', 'concerti'],
    'energico',
    'Artista',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Giulia Verdi',
    'giulia_food',
    null,
    ARRAY['cucina', 'wine', 'eventi'],
    'socievole',
    'Chef',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Andrea Neri',
    'andrea_live',
    null,
    ARRAY['live', 'dj', 'festival'],
    'creativo',
    'DJ',
    '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Add sample availability for test users
INSERT INTO public.available_now (user_id, start_at, end_at, status, mood, preferences)
VALUES 
  ('11111111-1111-1111-1111-111111111111', now(), now() + interval '4 hours', 'available', 'chill', '{"activities": ["musica", "aperitivo"]}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', now(), now() + interval '3 hours', 'available', 'energico', '{"activities": ["arte", "concerti"]}'::jsonb),
  ('33333333-3333-3333-3333-333333333333', now(), now() + interval '5 hours', 'available', 'socievole', '{"activities": ["cucina", "wine"]}'::jsonb),
  ('44444444-4444-4444-4444-444444444444', now(), now() + interval '6 hours', 'available', 'creativo', '{"activities": ["live", "dj"]}'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  status = EXCLUDED.status;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();