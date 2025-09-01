-- Fix critical security vulnerabilities and add payment support

-- 1. Update subscribers table policies to be more restrictive
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;
CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());

-- 2. Add payment tracking for moments
ALTER TABLE public.moments 
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS livemoment_fee_percentage INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS organizer_fee_percentage INTEGER DEFAULT 0;

-- 3. Add device tokens table for push notifications
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own device tokens" 
ON public.device_tokens 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Update moment_participants to include better payment tracking
ALTER TABLE public.moment_participants 
ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS livemoment_fee_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS organizer_fee_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- 5. Add notifications for payments
INSERT INTO public.notifications (user_id, type, title, message, data)
SELECT 
  host_id,
  'payment_received',
  'Pagamento ricevuto',
  'Hai ricevuto un pagamento per il tuo momento',
  jsonb_build_object('moment_id', id, 'amount', price_cents)
FROM public.moments 
WHERE payment_required = true AND price_cents > 0
ON CONFLICT DO NOTHING;

-- 6. Create function to auto-create group chats for moments
CREATE OR REPLACE FUNCTION public.create_moment_group_chat()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a group for the moment if it doesn't exist
  INSERT INTO public.groups (
    id,
    title,
    description,
    category,
    host_id,
    participants,
    is_public,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, -- Use same ID as moment
    'Chat: ' || NEW.title,
    'Chat di gruppo per il momento: ' || NEW.title,
    'moment_chat',
    NEW.host_id,
    ARRAY[NEW.host_id],
    false,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for moment group chat creation
DROP TRIGGER IF EXISTS create_moment_group_chat_trigger ON public.moments;
CREATE TRIGGER create_moment_group_chat_trigger
AFTER INSERT ON public.moments
FOR EACH ROW
EXECUTE FUNCTION public.create_moment_group_chat();

-- 7. Function to add participant to moment group chat
CREATE OR REPLACE FUNCTION public.add_participant_to_moment_chat()
RETURNS TRIGGER AS $$
BEGIN
  -- Add participant to the moment's group chat
  UPDATE public.groups 
  SET participants = array_append(participants, NEW.user_id),
      updated_at = now()
  WHERE id = NEW.moment_id
  AND NOT (NEW.user_id = ANY(participants));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for participant addition to group chat
DROP TRIGGER IF EXISTS add_participant_to_moment_chat_trigger ON public.moment_participants;
CREATE TRIGGER add_participant_to_moment_chat_trigger
AFTER INSERT ON public.moment_participants
FOR EACH ROW
EXECUTE FUNCTION public.add_participant_to_moment_chat();

-- 8. Update user_presence policies to be more secure
DROP POLICY IF EXISTS "Users can view online users" ON public.user_presence;
CREATE POLICY "Users can view online users" 
ON public.user_presence 
FOR SELECT 
USING (
  is_online = true AND (
    -- Allow viewing if user is in a mutual moment or group
    EXISTS (
      SELECT 1 FROM public.moments m 
      WHERE (m.host_id = auth.uid() OR auth.uid() = ANY(m.participants))
      AND (m.host_id = user_id OR user_id = ANY(m.participants))
    )
    OR
    EXISTS (
      SELECT 1 FROM public.groups g 
      WHERE (g.host_id = auth.uid() OR auth.uid() = ANY(g.participants))
      AND (g.host_id = user_id OR user_id = ANY(g.participants))
    )
  )
);

-- 9. Create payment processing table
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  moment_id UUID,
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  livemoment_fee_cents INTEGER NOT NULL DEFAULT 0,
  organizer_fee_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment sessions" 
ON public.payment_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Payment sessions can be inserted by system" 
ON public.payment_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Payment sessions can be updated by system" 
ON public.payment_sessions 
FOR UPDATE 
USING (true);