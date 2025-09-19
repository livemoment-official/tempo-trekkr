-- Create polls table for chat polls
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of poll options: [{"text": "Option 1", "count": 0}, {"text": "Option 2", "count": 0}]
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  allows_multiple BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL, -- Index of the selected option in the poll's options array
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index) -- Allow multiple votes only if poll allows it
);

-- Add media and poll support to group_messages
ALTER TABLE public.group_messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'poll')),
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size INTEGER,
ADD COLUMN duration_seconds INTEGER, -- For audio/video
ADD COLUMN poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE;

-- Add media and poll support to messages (private conversations)
ALTER TABLE public.messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'poll')),
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size INTEGER,
ADD COLUMN duration_seconds INTEGER, -- For audio/video
ADD COLUMN poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE;

-- Create chat-media bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-media', 'chat-media', true);

-- Create function to update poll counts when votes are added/removed
CREATE OR REPLACE FUNCTION public.update_poll_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update poll options count
  UPDATE public.polls 
  SET options = (
    SELECT jsonb_agg(
      jsonb_set(
        option,
        '{count}',
        (
          SELECT COALESCE(COUNT(*), 0)::text::jsonb
          FROM poll_votes pv 
          WHERE pv.poll_id = polls.id 
          AND pv.option_index = (option_index.value)::integer
        )
      )
    )
    FROM jsonb_array_elements(options) WITH ORDINALITY AS option_with_index(option, option_index)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.poll_id, OLD.poll_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_poll_counts_on_vote_insert
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_counts();

CREATE TRIGGER update_poll_counts_on_vote_delete
  AFTER DELETE ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_counts();