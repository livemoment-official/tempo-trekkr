-- Add missing fields to venues table for location registration wizard
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS contact_person_name TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS contact_person_surname TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS how_discovered TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS social_media_profiles JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS artist_benefits TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS artist_welcome_message TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS community_advantages TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS rewards_10_people TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS rewards_30_people TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS special_offer TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS agreement_types TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS rental_cost_info TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS preferred_event_types TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS music_genres TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS max_capacity_seated INTEGER;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS max_capacity_standing INTEGER;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS audio_setup TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS additional_equipment TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS service_details TEXT[];
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS recommended_hours TEXT;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS venue_photos TEXT[];

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_venues_user_id ON public.venues(user_id);
CREATE INDEX IF NOT EXISTS idx_venues_venue_type ON public.venues(venue_type);
CREATE INDEX IF NOT EXISTS idx_venues_location ON public.venues USING GIN(location);