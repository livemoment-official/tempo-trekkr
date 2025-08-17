-- Update notifications table and fix invite creation

-- Add related_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_id') THEN
        ALTER TABLE public.notifications ADD COLUMN related_id UUID;
    END IF;
END $$;

-- Update RLS policy for notifications to allow system inserts
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

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

-- Update test profiles locations to be near Rome for testing
UPDATE public.profiles 
SET location = '{"lat": 41.9028, "lng": 12.4964, "accuracy": 100, "updated_at": "2024-01-17T18:00:00Z"}'::jsonb
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- Ensure availability exists for test users
INSERT INTO public.availability (user_id, start_at, end_at, is_on, shareable)
VALUES 
  ('11111111-1111-1111-1111-111111111111', now(), now() + interval '4 hours', true, true),
  ('22222222-2222-2222-2222-222222222222', now(), now() + interval '3 hours', true, true),
  ('33333333-3333-3333-3333-333333333333', now(), now() + interval '5 hours', true, true),
  ('44444444-4444-4444-4444-444444444444', now(), now() + interval '6 hours', true, true)
ON CONFLICT (user_id) DO UPDATE SET 
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  is_on = true,
  shareable = true;