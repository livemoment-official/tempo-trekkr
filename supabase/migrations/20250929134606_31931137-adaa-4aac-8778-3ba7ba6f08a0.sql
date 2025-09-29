-- Add support for multi-location selection and advanced ticketing

-- Add max_venues field to events table (default 3)
ALTER TABLE public.events 
ADD COLUMN max_venues INTEGER DEFAULT 3 CHECK (max_venues > 0 AND max_venues <= 5);

-- Add priority_order to event_venues table for multi-location selection
ALTER TABLE public.event_venues
ADD COLUMN priority_order INTEGER DEFAULT 1 CHECK (priority_order > 0 AND priority_order <= 5);

-- Update event_venues status enum to include more granular states
ALTER TABLE public.event_venues 
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;

-- Add advanced ticketing support to events table
ALTER TABLE public.events
ADD COLUMN advanced_ticketing JSONB DEFAULT NULL;

-- Create function to auto-exclude other venues when one accepts
CREATE OR REPLACE FUNCTION public.handle_venue_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If venue status changed to 'accepted', mark others as 'excluded'
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Set accepted timestamp
    NEW.accepted_at = now();
    
    -- Update other venues for this event to 'excluded' status
    UPDATE public.event_venues 
    SET status = 'excluded', updated_at = now()
    WHERE event_id = NEW.event_id 
      AND id != NEW.id 
      AND status NOT IN ('accepted', 'excluded');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;