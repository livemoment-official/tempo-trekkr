-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.following_id,
    'follow',
    'Nuovo follower',
    'Qualcuno ha iniziato a seguirti',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.create_reaction_notification()
RETURNS TRIGGER AS $$
DECLARE
  moment_host_id UUID;
BEGIN
  -- Get the moment host
  SELECT host_id INTO moment_host_id 
  FROM moments 
  WHERE id = NEW.moment_id;
  
  -- Don't notify if user reacted to their own moment
  IF moment_host_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      moment_host_id,
      'reaction',
      'Nuova reazione',
      'Qualcuno ha reagito al tuo momento',
      jsonb_build_object('moment_id', NEW.moment_id, 'user_id', NEW.user_id, 'reaction_type', NEW.reaction_type)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  moment_host_id UUID;
BEGIN
  -- Get the moment host
  SELECT host_id INTO moment_host_id 
  FROM moments 
  WHERE id = NEW.moment_id;
  
  -- Don't notify if user commented on their own moment
  IF moment_host_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      moment_host_id,
      'comment',
      'Nuovo commento',
      'Qualcuno ha commentato il tuo momento',
      jsonb_build_object('moment_id', NEW.moment_id, 'user_id', NEW.user_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';