-- Extend artists table with detailed fields from mockups
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS stage_name text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS age integer;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS artist_type text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS specialization text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{}';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS exhibition_description text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS ideal_situations text[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS target_provinces text[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS event_types text[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS experience_years integer;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instruments text[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS audience_size text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS performance_duration text;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cachet_info jsonb DEFAULT '{}';
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS profile_video_url text;

-- Extend venues table with detailed fields
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS venue_type text;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS services text[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS equipment jsonb DEFAULT '{}';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS space_photos text[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{}';
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS booking_info jsonb DEFAULT '{}';

-- Extend staff_profiles table with detailed fields
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS specializations text[];
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS portfolio_urls text[];
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS rates jsonb DEFAULT '{}';
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS availability_info jsonb DEFAULT '{}';
ALTER TABLE public.staff_profiles ADD COLUMN IF NOT EXISTS certifications text[];