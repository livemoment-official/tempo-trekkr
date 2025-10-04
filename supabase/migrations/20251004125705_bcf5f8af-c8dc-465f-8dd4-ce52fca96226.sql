-- Add activity_category column to invites table
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS activity_category TEXT;

-- Create function to send notifications when invite is created
CREATE OR REPLACE FUNCTION public.create_invite_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_id UUID;
  host_profile RECORD;
BEGIN
  -- Get host profile info
  SELECT name, username INTO host_profile
  FROM profiles
  WHERE id = NEW.host_id;
  
  -- Create notification for each invited participant
  FOREACH participant_id IN ARRAY NEW.participants
  LOOP
    IF participant_id != NEW.host_id THEN
      INSERT INTO public.notifications (user_id, type, title, message, data, read)
      VALUES (
        participant_id,
        'invite_received',
        'Nuovo invito da ' || COALESCE(host_profile.name, host_profile.username, 'Un utente'),
        NEW.title,
        jsonb_build_object(
          'invite_id', NEW.id,
          'host_id', NEW.host_id,
          'activity', NEW.title,
          'when_at', NEW.when_at
        ),
        false
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for invite notifications
DROP TRIGGER IF EXISTS on_invite_created ON public.invites;
CREATE TRIGGER on_invite_created
  AFTER INSERT ON public.invites
  FOR EACH ROW
  EXECUTE FUNCTION public.create_invite_notification();