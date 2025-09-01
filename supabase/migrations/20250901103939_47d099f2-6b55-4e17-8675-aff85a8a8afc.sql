-- Fix security linter warnings for function search paths

-- 1. Fix create_moment_group_chat function
CREATE OR REPLACE FUNCTION public.create_moment_group_chat()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Create a group for the moment if it doesn't exist
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
  ) VALUES (
    NEW.id, -- Use same ID as moment
    'Chat: ' || NEW.title,
    'Chat di gruppo per il momento: ' || NEW.title,
    'moment_chat',
    NEW.host_id,
    ARRAY[NEW.host_id],
    false,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- 2. Fix add_participant_to_moment_chat function
CREATE OR REPLACE FUNCTION public.add_participant_to_moment_chat()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Add participant to the moment's group chat
  UPDATE public.groups 
  SET participants = array_append(participants, NEW.user_id),
      updated_at = now()
  WHERE id = NEW.moment_id
  AND NOT (NEW.user_id = ANY(participants));
  
  RETURN NEW;
END;
$$;