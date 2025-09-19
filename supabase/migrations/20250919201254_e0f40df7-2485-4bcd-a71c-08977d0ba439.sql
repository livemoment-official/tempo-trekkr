-- Create gamification tables for rewards system
-- User achievements to track progress on different challenges
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User points history to track all point transactions
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID, -- moment_id, group_id, etc.
  reference_type TEXT, -- 'moment', 'group', 'friend', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add gamification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (true);

-- Create policies for user_points
CREATE POLICY "Users can view their own points" 
ON public.user_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create point transactions" 
ON public.user_points 
FOR INSERT 
WITH CHECK (true);

-- Create function to add points and update profile
CREATE OR REPLACE FUNCTION public.add_user_points(
  target_user_id UUID,
  points_amount INTEGER,
  reason TEXT,
  ref_id UUID DEFAULT NULL,
  ref_type TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert point transaction
  INSERT INTO public.user_points (user_id, points, reason, reference_id, reference_type)
  VALUES (target_user_id, points_amount, reason, ref_id, ref_type);
  
  -- Update total points in profile
  UPDATE public.profiles 
  SET total_points = COALESCE(total_points, 0) + points_amount,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Update level based on points (every 500 points = 1 level)
  UPDATE public.profiles 
  SET current_level = LEAST(FLOOR(COALESCE(total_points, 0) / 500) + 1, 10)
  WHERE id = target_user_id;
END;
$$;

-- Create function to unlock achievement
CREATE OR REPLACE FUNCTION public.unlock_achievement(
  target_user_id UUID,
  achievement_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_points INTEGER;
BEGIN
  -- Update achievement status
  UPDATE public.user_achievements 
  SET unlocked = true, unlocked_at = now(), updated_at = now()
  WHERE user_id = target_user_id 
    AND achievement_type = unlock_achievement.achievement_type 
    AND unlocked = false
  RETURNING points INTO achievement_points;
  
  -- Add points for unlocking achievement
  IF achievement_points IS NOT NULL THEN
    PERFORM add_user_points(target_user_id, achievement_points, 'Achievement unlocked: ' || achievement_type);
  END IF;
END;
$$;

-- Create function to initialize user achievements
CREATE OR REPLACE FUNCTION public.initialize_user_achievements(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create basic achievements for new users
  INSERT INTO public.user_achievements (user_id, achievement_type, title, description, points, target) VALUES
  (target_user_id, 'profile_complete', 'Profilo Completo', 'Completa il tuo profilo con foto e informazioni', 50, 1),
  (target_user_id, 'first_moment', 'Primo Momento', 'Crea il tuo primo momento', 100, 1),
  (target_user_id, 'social_butterfly', 'Farfalla Sociale', 'Invita 3 amici', 150, 3),
  (target_user_id, 'group_creator', 'Creatore di Gruppi', 'Crea un gruppo con almeno 5 partecipanti', 200, 1),
  (target_user_id, 'network_builder', 'Costruttore di Network', 'Aggiungi 10 amici alla tua rete', 100, 10),
  (target_user_id, 'event_host', 'Host Eventi', 'Organizza 3 eventi di successo', 300, 3),
  (target_user_id, 'community_star', 'Stella della Community', 'Ricevi 50 reazioni positive', 250, 50);
END;
$$;

-- Create trigger to initialize achievements for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Initialize achievements for new user
  PERFORM initialize_user_achievements(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on profiles insert
CREATE OR REPLACE TRIGGER initialize_achievements_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_achievements();

-- Create triggers for magic moments
-- Trigger for moment creation
CREATE OR REPLACE FUNCTION public.handle_moment_creation_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add points for creating moment
  PERFORM add_user_points(NEW.host_id, 100, 'Momento creato', NEW.id, 'moment');
  
  -- Check if this unlocks first moment achievement
  UPDATE public.user_achievements 
  SET progress = progress + 1, updated_at = now()
  WHERE user_id = NEW.host_id AND achievement_type = 'first_moment';
  
  -- Unlock achievement if target reached
  UPDATE public.user_achievements 
  SET unlocked = true, unlocked_at = now()
  WHERE user_id = NEW.host_id 
    AND achievement_type = 'first_moment' 
    AND progress >= target 
    AND unlocked = false;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER moment_creation_points
  AFTER INSERT ON public.moments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_moment_creation_points();

-- Trigger for group creation
CREATE OR REPLACE FUNCTION public.handle_group_creation_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add points for creating group (if it has participants)
  IF array_length(NEW.participants, 1) >= 5 THEN
    PERFORM add_user_points(NEW.host_id, 200, 'Gruppo creato con 5+ partecipanti', NEW.id, 'group');
    
    -- Update group creator achievement
    UPDATE public.user_achievements 
    SET progress = progress + 1, updated_at = now()
    WHERE user_id = NEW.host_id AND achievement_type = 'group_creator';
    
    -- Unlock if target reached
    UPDATE public.user_achievements 
    SET unlocked = true, unlocked_at = now()
    WHERE user_id = NEW.host_id 
      AND achievement_type = 'group_creator' 
      AND progress >= target 
      AND unlocked = false;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER group_creation_points
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_group_creation_points();

-- Trigger for friendship creation
CREATE OR REPLACE FUNCTION public.handle_friendship_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Add points for both users
    PERFORM add_user_points(NEW.user_id, 25, 'Nuova amicizia', NEW.friend_user_id, 'friendship');
    PERFORM add_user_points(NEW.friend_user_id, 25, 'Nuova amicizia', NEW.user_id, 'friendship');
    
    -- Update network builder achievement for both users
    UPDATE public.user_achievements 
    SET progress = progress + 1, updated_at = now()
    WHERE user_id IN (NEW.user_id, NEW.friend_user_id) 
      AND achievement_type = 'network_builder';
    
    -- Unlock achievement if target reached
    UPDATE public.user_achievements 
    SET unlocked = true, unlocked_at = now()
    WHERE user_id IN (NEW.user_id, NEW.friend_user_id)
      AND achievement_type = 'network_builder' 
      AND progress >= target 
      AND unlocked = false;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER friendship_points
  AFTER UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_friendship_points();

-- Update timestamp function for achievements
CREATE OR REPLACE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_created_at ON public.user_points(created_at DESC);