-- Create reactions table for moments
CREATE TABLE public.moment_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'fire', 'star', 'thumbs_up')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(moment_id, user_id)
);

-- Create comments table for moments
CREATE TABLE public.moment_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user presence table for real-time location tracking
CREATE TABLE public.user_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  location JSONB,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_online BOOLEAN NOT NULL DEFAULT false,
  status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for tracking interactions
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.moment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for moment_reactions
CREATE POLICY "Users can view reactions on public moments" 
ON public.moment_reactions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM moments 
  WHERE id = moment_reactions.moment_id 
  AND (is_public = true OR host_id = auth.uid() OR auth.uid() = ANY(participants))
));

CREATE POLICY "Users can create their own reactions" 
ON public.moment_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.moment_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for moment_comments
CREATE POLICY "Users can view comments on accessible moments" 
ON public.moment_comments FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM moments 
  WHERE id = moment_comments.moment_id 
  AND (is_public = true OR host_id = auth.uid() OR auth.uid() = ANY(participants))
));

CREATE POLICY "Users can create comments on accessible moments" 
ON public.moment_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM moments 
  WHERE id = moment_comments.moment_id 
  AND (is_public = true OR host_id = auth.uid() OR auth.uid() = ANY(participants))
));

CREATE POLICY "Users can update their own comments" 
ON public.moment_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.moment_comments FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_presence
CREATE POLICY "Users can view online users" 
ON public.user_presence FOR SELECT 
USING (is_online = true);

CREATE POLICY "Users can update their own presence" 
ON public.user_presence FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.user_analytics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_moment_comments_updated_at
  BEFORE UPDATE ON public.moment_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_user_presence_updated_at
  BEFORE UPDATE ON public.user_presence
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create notification triggers
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER follow_notification_trigger
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();

CREATE TRIGGER reaction_notification_trigger
  AFTER INSERT ON public.moment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_reaction_notification();

CREATE TRIGGER comment_notification_trigger
  AFTER INSERT ON public.moment_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();

-- Enable realtime for key tables
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.moment_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.moment_comments REPLICA IDENTITY FULL;
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;