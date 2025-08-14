-- Create artists table for events
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  genres TEXT[],
  location JSONB,
  contact_info JSONB,
  pricing JSONB,
  availability JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venues table for events
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB,
  location JSONB NOT NULL,
  capacity INTEGER,
  amenities TEXT[],
  contact_info JSONB,
  pricing JSONB,
  availability JSONB,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for artists
CREATE POLICY "Artists are viewable by everyone" 
ON public.artists 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage artists" 
ON public.artists 
FOR ALL 
USING (false);

-- RLS policies for venues
CREATE POLICY "Venues are viewable by everyone" 
ON public.venues 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage venues" 
ON public.venues 
FOR ALL 
USING (false);

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_artists_updated_at
BEFORE UPDATE ON public.artists
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();