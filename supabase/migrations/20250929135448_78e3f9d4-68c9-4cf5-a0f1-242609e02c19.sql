-- Create trigger for venue acceptance handling
CREATE TRIGGER handle_venue_acceptance_trigger
  BEFORE UPDATE ON public.event_venues
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_venue_acceptance();