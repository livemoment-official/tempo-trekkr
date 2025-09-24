-- Fix the malformed RLS policy for friends-only profiles
DROP POLICY IF EXISTS "Friends-only profiles viewable by friends" ON public.profiles;

-- Create the corrected policy for friends-only profiles
CREATE POLICY "Friends-only profiles viewable by friends" ON public.profiles
FOR SELECT 
USING (
  privacy_level = 'friends_only'::privacy_level_type AND (
    auth.uid() = id OR -- Users can always view their own profile
    EXISTS (
      SELECT 1 FROM friendships f
      WHERE f.status = 'accepted'::text
      AND (
        (f.user_id = auth.uid() AND f.friend_user_id = profiles.id) OR
        (f.user_id = profiles.id AND f.friend_user_id = auth.uid())
      )
    )
  )
);

-- Also ensure that there's a proper policy for users to view their own profiles
-- This should already exist, but let's make sure it's correct
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Make sure public profiles policy is correct
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT
USING (privacy_level = 'public'::privacy_level_type);