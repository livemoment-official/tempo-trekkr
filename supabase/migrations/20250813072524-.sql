-- 1) Extend availability with shareable flag
ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS shareable boolean NOT NULL DEFAULT false;

-- 2) Indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_shareable_end_at
  ON public.availability (shareable, end_at);
CREATE INDEX IF NOT EXISTS idx_availability_start_at
  ON public.availability (start_at);

-- 3) RLS policy to allow public viewing of shareable, time-valid slots
DROP POLICY IF EXISTS "Public can view shareable availability within time" ON public.availability;
CREATE POLICY "Public can view shareable availability within time"
ON public.availability
FOR SELECT
USING (
  shareable = true
  AND (
    end_at IS NULL OR end_at >= now()
  )
);

-- 4) View to list people available now with profile info
DROP VIEW IF EXISTS public.available_now;
CREATE VIEW public.available_now AS
SELECT 
  a.id AS availability_id,
  a.user_id,
  a.start_at,
  a.end_at,
  a.is_on,
  a.shareable,
  p.username,
  p.name,
  p.avatar_url,
  p.interests,
  p.mood,
  p.job_title
FROM public.availability a
JOIN public.profiles p ON p.id = a.user_id
WHERE a.shareable = true
  AND coalesce(a.start_at, now()) <= now()
  AND coalesce(a.end_at, now() + interval '100 years') >= now();

COMMENT ON VIEW public.available_now IS 'People who are publicly available right now, joined with basic profile info.';