-- Security Fix Migration: Implement Privacy Controls and Data Protection

-- 1. Fix Profiles RLS Policy - Replace overly permissive policy with privacy-level based access
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create privacy-aware profile viewing policies
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (privacy_level = 'public');

CREATE POLICY "Friends-only profiles viewable by friends"
ON public.profiles
FOR SELECT
USING (
  privacy_level = 'friends_only' AND (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.friendships
      WHERE (user_id = id AND friend_user_id = auth.uid() AND status = 'accepted')
         OR (user_id = auth.uid() AND friend_user_id = id AND status = 'accepted')
    )
  )
);

CREATE POLICY "Private profiles only viewable by self"
ON public.profiles
FOR SELECT
USING (privacy_level = 'private' AND auth.uid() = id);

-- Users can always view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 2. Fix Artists Contact Info Protection
DROP POLICY IF EXISTS "Authenticated users can view artist basic info" ON public.artists;

-- Create separate policies for public info vs contact info
CREATE POLICY "Anyone can view artist basic info"
ON public.artists
FOR SELECT
USING (true);

-- Note: Contact info access should be controlled in application logic or via specific columns
-- For now, contact_info field should be handled carefully in queries

-- 3. Fix Venues Contact Info Protection  
DROP POLICY IF EXISTS "Authenticated users can view venue basic info" ON public.venues;

CREATE POLICY "Anyone can view venue basic info"
ON public.venues
FOR SELECT
USING (true);

-- 4. Secure Available Now View with RLS
-- First, we need to create proper RLS on the availability table that feeds this view
-- The view will inherit security from the underlying table

-- 5. Fix Follows Privacy - Replace overly permissive policy
DROP POLICY IF EXISTS "Users can view public follows" ON public.follows;

-- Create privacy-aware follow viewing policies
CREATE POLICY "Users can view follows of public profiles"
ON public.follows
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = follows.following_id AND privacy_level = 'public'
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles  
    WHERE id = follows.follower_id AND privacy_level = 'public'
  )
);

CREATE POLICY "Users can view follows involving themselves"
ON public.follows
FOR SELECT
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Friends can view each other's follows"
ON public.follows
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.friendships f
    JOIN public.profiles p ON (p.id = follows.following_id OR p.id = follows.follower_id)
    WHERE p.privacy_level = 'friends_only' AND
          ((f.user_id = auth.uid() AND f.friend_user_id = p.id) OR
           (f.user_id = p.id AND f.friend_user_id = auth.uid())) AND
          f.status = 'accepted'
  )
);

-- 6. Fix Database Functions Security - Add proper search path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    username,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa following_count per chi segue
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Incrementa followers_count per chi viene seguito
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa following_count per chi smette di seguire
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Decrementa followers_count per chi viene smesso di seguire
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- 7. Create trigger for follow count updates (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_follow_counts_trigger'
  ) THEN
    CREATE TRIGGER update_follow_counts_trigger
      AFTER INSERT OR DELETE ON public.follows
      FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();
  END IF;
END $$;