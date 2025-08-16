-- Creare enum per le nuove tipologie prima di aggiungere le colonne
CREATE TYPE public.chat_permission_type AS ENUM ('everyone', 'friends_only', 'followers_only', 'none');
CREATE TYPE public.privacy_level_type AS ENUM ('public', 'friends_only', 'private');
CREATE TYPE public.personality_type AS ENUM (
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP', 
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
);

-- Estendere la tabella profiles con nuovi campi usando i tipi enum corretti
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personality_type personality_type;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chat_permission chat_permission_type DEFAULT 'friends_only';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_level privacy_level_type DEFAULT 'public';

-- Creare tabella follows (separata da friendships)
CREATE TABLE public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Abilitare RLS su follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Politiche per follows
CREATE POLICY "Users can view public follows" ON public.follows
FOR SELECT USING (true);

CREATE POLICY "Users can create their own follows" ON public.follows  
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON public.follows
FOR DELETE USING (auth.uid() = follower_id);

-- Creare tabella per conversazioni
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(participant_1, participant_2),
  CHECK (participant_1 != participant_2)
);

-- Abilitare RLS su conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Politiche per conversations
CREATE POLICY "Users can view their conversations" ON public.conversations
FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations" ON public.conversations  
FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Creare tabella per messaggi
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Abilitare RLS su messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Politiche per messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  )
);

-- Trigger per aggiornare contatori follows
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa following_count per chi segue
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Incrementa followers_count per chi viene seguito
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa following_count per chi smette di seguire
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
    
    -- Decrementa followers_count per chi viene smesso di seguire
    UPDATE public.profiles 
    SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Creare trigger per follows
CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();