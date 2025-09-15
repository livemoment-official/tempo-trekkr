-- Add user_id to artists table
ALTER TABLE public.artists ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to venues table  
ALTER TABLE public.venues ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create staff_profiles table
CREATE TABLE public.staff_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  skills TEXT[],
  experience_years INTEGER,
  contact_info JSONB,
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on staff_profiles
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for staff_profiles
CREATE POLICY "Users can view their own staff profiles" 
ON public.staff_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own staff profiles" 
ON public.staff_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staff profiles" 
ON public.staff_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own staff profiles" 
ON public.staff_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies for artists to include user_id
DROP POLICY IF EXISTS "Admins can manage artists" ON public.artists;
DROP POLICY IF EXISTS "Anyone can view artist basic info" ON public.artists;

CREATE POLICY "Anyone can view artist basic info" 
ON public.artists 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own artist profiles" 
ON public.artists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artist profiles" 
ON public.artists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all artists" 
ON public.artists 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policies for venues to include user_id
DROP POLICY IF EXISTS "Admins can manage venues" ON public.venues;
DROP POLICY IF EXISTS "Anyone can view venue basic info" ON public.venues;

CREATE POLICY "Anyone can view venue basic info" 
ON public.venues 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own venue profiles" 
ON public.venues 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own venue profiles" 
ON public.venues 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all venues" 
ON public.venues 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_artists_user_id ON public.artists(user_id);
CREATE INDEX idx_venues_user_id ON public.venues(user_id);
CREATE INDEX idx_staff_profiles_user_id ON public.staff_profiles(user_id);

-- Add trigger for staff_profiles updated_at
CREATE TRIGGER update_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();