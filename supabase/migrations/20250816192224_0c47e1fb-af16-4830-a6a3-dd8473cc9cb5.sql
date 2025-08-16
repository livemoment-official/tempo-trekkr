-- Estensione delle tabelle moments ed events per i nuovi campi richiesti

-- Aggiungere campi alle tabelle moments
ALTER TABLE public.moments 
ADD COLUMN IF NOT EXISTS age_range_min INTEGER,
ADD COLUMN IF NOT EXISTS age_range_max INTEGER,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS mood_tag TEXT,
ADD COLUMN IF NOT EXISTS ticketing JSONB,
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'open';

-- Aggiungere campi alle tabelle events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS age_range_min INTEGER,
ADD COLUMN IF NOT EXISTS age_range_max INTEGER,
ADD COLUMN IF NOT EXISTS max_participants INTEGER,
ADD COLUMN IF NOT EXISTS mood_tag TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'open';

-- Creare tabella per tracciare le partecipazioni ai momenti
CREATE TABLE IF NOT EXISTS public.moment_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, pending, cancelled
  payment_status TEXT DEFAULT 'free', -- free, paid, pending_payment
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(moment_id, user_id)
);

-- Creare tabella per tracciare le partecipazioni agli eventi
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, pending, cancelled
  payment_status TEXT DEFAULT 'free', -- free, paid, pending_payment
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Abilitare RLS per le nuove tabelle
ALTER TABLE public.moment_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Creare policy per moment_participants
CREATE POLICY "Users can view their own participations" 
ON public.moment_participants
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own participations" 
ON public.moment_participants
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participations" 
ON public.moment_participants
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Hosts can view their moment participants" 
ON public.moment_participants
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.moments 
  WHERE moments.id = moment_participants.moment_id 
  AND moments.host_id = auth.uid()
));

-- Creare policy per event_participants
CREATE POLICY "Users can view their own event participations" 
ON public.event_participants
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own event participations" 
ON public.event_participants
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event participations" 
ON public.event_participants
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Event hosts can view their participants" 
ON public.event_participants
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.events 
  WHERE events.id = event_participants.event_id 
  AND events.host_id = auth.uid()
));

-- Aggiungere trigger per updated_at
CREATE TRIGGER update_moment_participants_updated_at
BEFORE UPDATE ON public.moment_participants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_event_participants_updated_at
BEFORE UPDATE ON public.event_participants
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();