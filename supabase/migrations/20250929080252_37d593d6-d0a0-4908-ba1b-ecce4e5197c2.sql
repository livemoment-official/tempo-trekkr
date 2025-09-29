-- Create secure RPC functions for moment participation
CREATE OR REPLACE FUNCTION public.join_moment(target_moment_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  moment_max_capacity INTEGER;
  current_participants INTEGER;
BEGIN
  -- Check if moment exists and get max capacity
  SELECT max_participants INTO moment_max_capacity
  FROM moments 
  WHERE id = target_moment_id;
  
  IF moment_max_capacity IS NULL THEN
    RETURN 'not_found';
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (
    SELECT 1 FROM moment_participants 
    WHERE moment_id = target_moment_id 
    AND user_id = auth.uid() 
    AND status = 'confirmed'
  ) THEN
    RETURN 'already_joined';
  END IF;
  
  -- Count current confirmed participants
  SELECT COUNT(*) INTO current_participants
  FROM moment_participants
  WHERE moment_id = target_moment_id
  AND status = 'confirmed';
  
  -- Check capacity
  IF moment_max_capacity IS NOT NULL AND current_participants >= moment_max_capacity THEN
    RETURN 'full';
  END IF;
  
  -- Insert or update participant
  INSERT INTO moment_participants (moment_id, user_id, status, payment_status)
  VALUES (target_moment_id, auth.uid(), 'confirmed', 'free')
  ON CONFLICT (moment_id, user_id) 
  DO UPDATE SET status = 'confirmed', updated_at = now();
  
  RETURN 'joined';
END;
$$;

-- Create function to remove participant from moment chat
CREATE OR REPLACE FUNCTION public.remove_participant_from_moment_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove participant from the moment's group chat
  UPDATE public.groups 
  SET participants = array_remove(participants, OLD.user_id),
      updated_at = now()
  WHERE id = OLD.moment_id
  AND OLD.user_id = ANY(participants);
  
  RETURN OLD;
END;
$$;

-- Create comprehensive trigger for moment creation to ensure group chat exists
DROP TRIGGER IF EXISTS create_moment_group_chat_trigger ON public.moments;
CREATE TRIGGER create_moment_group_chat_trigger
  AFTER INSERT ON public.moments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_moment_group_chat();

-- Create trigger to sync participants array when moment_participants changes
DROP TRIGGER IF EXISTS sync_moment_participants_trigger ON public.moment_participants;
CREATE TRIGGER sync_moment_participants_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_moment_participants_array();

-- Create trigger to add participant to group chat
DROP TRIGGER IF EXISTS add_participant_to_chat_trigger ON public.moment_participants;
CREATE TRIGGER add_participant_to_chat_trigger
  AFTER INSERT ON public.moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.add_participant_to_moment_chat();

-- Create trigger to remove participant from group chat when leaving
DROP TRIGGER IF EXISTS remove_participant_from_chat_trigger ON public.moment_participants;
CREATE TRIGGER remove_participant_from_chat_trigger
  AFTER DELETE ON public.moment_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.remove_participant_from_moment_chat();

-- Create trigger for status changes (confirmed to other status)
DROP TRIGGER IF EXISTS remove_participant_status_change_trigger ON public.moment_participants;
CREATE TRIGGER remove_participant_status_change_trigger
  AFTER UPDATE OF status ON public.moment_participants
  FOR EACH ROW
  WHEN (OLD.status = 'confirmed' AND NEW.status != 'confirmed')
  EXECUTE FUNCTION public.remove_participant_from_moment_chat();

-- Backfill historical data: create missing groups for existing moments
INSERT INTO public.groups (
  id,
  title,
  description,
  category,
  host_id,
  participants,
  is_public,
  created_at,
  updated_at
)
SELECT 
  m.id,
  'Chat: ' || m.title,
  'Chat di gruppo per il momento: ' || m.title,
  'moment_chat',
  m.host_id,
  ARRAY[m.host_id],
  false,
  m.created_at,
  m.updated_at
FROM public.moments m
WHERE NOT EXISTS (
  SELECT 1 FROM public.groups g WHERE g.id = m.id
);

-- Sync groups.participants from moment_participants for all moments
UPDATE public.groups 
SET participants = (
  SELECT COALESCE(array_agg(mp.user_id), ARRAY[groups.host_id])
  FROM moment_participants mp 
  WHERE mp.moment_id = groups.id
  AND mp.status = 'confirmed'
),
updated_at = now()
WHERE category = 'moment_chat';

-- Sync moments.participants from moment_participants table
UPDATE public.moments 
SET participants = (
  SELECT COALESCE(array_agg(mp.user_id), '{}')
  FROM moment_participants mp 
  WHERE mp.moment_id = moments.id
  AND mp.status = 'confirmed'
),
updated_at = now();

-- Enable realtime for moment_participants if not already enabled
ALTER TABLE public.moment_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.moment_participants;