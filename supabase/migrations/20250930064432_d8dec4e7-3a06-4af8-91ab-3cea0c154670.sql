-- Create city_groups table for province-based chat groups
CREATE TABLE IF NOT EXISTS public.city_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL UNIQUE,
  description TEXT,
  participants UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.city_groups ENABLE ROW LEVEL SECURITY;

-- Everyone can view city groups
CREATE POLICY "Anyone can view city groups"
ON public.city_groups
FOR SELECT
USING (true);

-- Authenticated users can join city groups (update participants)
CREATE POLICY "Users can join city groups"
ON public.city_groups
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- System can create city groups
CREATE POLICY "System can create city groups"
ON public.city_groups
FOR INSERT
WITH CHECK (true);

-- Add trigger to update updated_at
CREATE TRIGGER set_city_groups_updated_at
BEFORE UPDATE ON public.city_groups
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Function to join a city group
CREATE OR REPLACE FUNCTION public.join_city_group(target_city_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create city group if it doesn't exist
  INSERT INTO public.city_groups (city_name, description, participants)
  VALUES (
    target_city_name,
    'Gruppo della provincia di ' || target_city_name,
    ARRAY[auth.uid()]
  )
  ON CONFLICT (city_name) 
  DO UPDATE SET 
    participants = array_append(
      CASE 
        WHEN auth.uid() = ANY(city_groups.participants) THEN city_groups.participants
        ELSE city_groups.participants
      END,
      auth.uid()
    ),
    updated_at = now()
  WHERE NOT (auth.uid() = ANY(city_groups.participants));
  
  RETURN 'joined';
END;
$$;

-- Function to leave a city group
CREATE OR REPLACE FUNCTION public.leave_city_group(target_city_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.city_groups
  SET 
    participants = array_remove(participants, auth.uid()),
    updated_at = now()
  WHERE city_name = target_city_name
  AND auth.uid() = ANY(participants);
  
  RETURN 'left';
END;
$$;

-- Function to get participant count for a city
CREATE OR REPLACE FUNCTION public.get_city_participant_count(target_city_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(array_length(participants, 1), 0)
    FROM public.city_groups
    WHERE city_name = target_city_name
  );
END;
$$;