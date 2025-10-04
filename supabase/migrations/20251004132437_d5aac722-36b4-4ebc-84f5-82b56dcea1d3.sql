-- Create formats table for format profiles
CREATE TABLE public.formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  social_link TEXT NOT NULL,
  representative_image TEXT NOT NULL,
  support_gallery TEXT[],
  logo_url TEXT,
  description TEXT NOT NULL,
  activities TEXT[],
  materials TEXT[],
  avg_participants INTEGER NOT NULL,
  avg_cost_per_participant INTEGER NOT NULL,
  artist_categories TEXT[] NOT NULL,
  staff_roles TEXT[],
  location_types TEXT[] NOT NULL,
  recommended_days TEXT NOT NULL,
  event_timings TEXT[],
  founder_name TEXT NOT NULL,
  founder_photo TEXT NOT NULL,
  founder_bio TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  founder_phone TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;

-- Users can create their own format profiles
CREATE POLICY "Users can create their own format profiles"
ON public.formats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own format profiles
CREATE POLICY "Users can update their own format profiles"
ON public.formats
FOR UPDATE
USING (auth.uid() = user_id);

-- Public can view format basic info only
CREATE POLICY "Public can view format basic info only"
ON public.formats
FOR SELECT
USING (true);

-- Format owners can view own full profile
CREATE POLICY "Format owners can view own full profile"
ON public.formats
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all formats
CREATE POLICY "Admins can manage all formats"
ON public.formats
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_formats_updated_at
BEFORE UPDATE ON public.formats
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();