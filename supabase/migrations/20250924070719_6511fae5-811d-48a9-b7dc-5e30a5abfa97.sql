-- Add deleted_at column to moments, events, and invites for soft delete functionality
ALTER TABLE public.moments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public.events ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public.invites ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Add indexes for better performance when filtering deleted content
CREATE INDEX idx_moments_deleted_at ON public.moments(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_events_deleted_at ON public.events(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_invites_deleted_at ON public.invites(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add indexes for temporal filtering (when_at)
CREATE INDEX idx_moments_when_at ON public.moments(when_at) WHERE when_at IS NOT NULL;
CREATE INDEX idx_events_when_at ON public.events(when_at) WHERE when_at IS NOT NULL;
CREATE INDEX idx_invites_when_at ON public.invites(when_at) WHERE when_at IS NOT NULL;

-- Update RLS policies to hide soft-deleted content for moments
DROP POLICY IF EXISTS "Public or permitted can view moments" ON public.moments;
CREATE POLICY "Public or permitted can view moments" ON public.moments
FOR SELECT USING (
  deleted_at IS NULL AND (
    (is_public = true) OR 
    (auth.uid() = host_id) OR 
    (auth.uid() = ANY(participants))
  )
);

-- Update RLS policies to hide soft-deleted content for events
DROP POLICY IF EXISTS "Events are viewable by everyone when discovery_on" ON public.events;
CREATE POLICY "Events are viewable by everyone when discovery_on" ON public.events
FOR SELECT USING (
  deleted_at IS NULL AND discovery_on = true
);

-- Update RLS policies to hide soft-deleted content for invites
DROP POLICY IF EXISTS "Host or participants can view invites" ON public.invites;
CREATE POLICY "Host or participants can view invites" ON public.invites
FOR SELECT USING (
  deleted_at IS NULL AND (
    (auth.uid() = host_id) OR 
    (auth.uid() = ANY(participants))
  )
);

-- Create function for automatic cleanup of soft-deleted content after 30 days
CREATE OR REPLACE FUNCTION cleanup_deleted_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete moments older than 30 days
  DELETE FROM public.moments 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < (NOW() - INTERVAL '30 days');
  
  -- Delete events older than 30 days
  DELETE FROM public.events 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < (NOW() - INTERVAL '30 days');
  
  -- Delete invites older than 30 days  
  DELETE FROM public.invites 
  WHERE deleted_at IS NOT NULL 
    AND deleted_at < (NOW() - INTERVAL '30 days');
  
  -- Log cleanup activity
  RAISE NOTICE 'Cleanup completed at %', NOW();
END;
$$;