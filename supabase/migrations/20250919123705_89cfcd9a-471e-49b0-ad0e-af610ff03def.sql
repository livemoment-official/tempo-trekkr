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

-- Enable RLS on polls
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- Create polls policies
CREATE POLICY "Users can create polls"
ON public.polls 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view polls they have access to"
ON public.polls 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM group_messages gm 
    JOIN groups g ON g.id = gm.group_id 
    WHERE gm.poll_id = polls.id 
    AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.participants))
  )
  OR EXISTS (
    SELECT 1 FROM messages m 
    JOIN conversations c ON c.id = m.conversation_id 
    WHERE m.poll_id = polls.id 
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
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

-- Enable RLS on poll_votes
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Create poll votes policies
CREATE POLICY "Users can vote on polls they have access to"
ON public.poll_votes 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM polls p 
    WHERE p.id = poll_votes.poll_id 
    AND (p.expires_at IS NULL OR p.expires_at > now())
  )
);

CREATE POLICY "Users can view votes on polls they have access to"
ON public.poll_votes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM polls p 
    WHERE p.id = poll_votes.poll_id 
    AND (
      EXISTS (
        SELECT 1 FROM group_messages gm 
        JOIN groups g ON g.id = gm.group_id 
        WHERE gm.poll_id = p.id 
        AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.participants))
      )
      OR EXISTS (
        SELECT 1 FROM messages m 
        JOIN conversations c ON c.id = m.conversation_id 
        WHERE m.poll_id = p.id 
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
      )
    )
  )
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

-- Create storage policies for chat media
CREATE POLICY "Chat media is accessible to conversation participants"
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-media' AND
  (
    -- For group messages
    EXISTS (
      SELECT 1 FROM group_messages gm 
      JOIN groups g ON g.id = gm.group_id 
      WHERE gm.file_url = CONCAT('https://pzivdgnqcyfxgmqaolux.supabase.co/storage/v1/object/public/chat-media/', name)
      AND (g.host_id = auth.uid() OR auth.uid() = ANY(g.participants))
    )
    OR
    -- For private messages
    EXISTS (
      SELECT 1 FROM messages m 
      JOIN conversations c ON c.id = m.conversation_id 
      WHERE m.file_url = CONCAT('https://pzivdgnqcyfxgmqaolux.supabase.co/storage/v1/object/public/chat-media/', name)
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  )
);

CREATE POLICY "Users can upload chat media"
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);

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

-- Create triggers for poll vote count updates
CREATE TRIGGER update_poll_counts_on_vote_insert
  AFTER INSERT ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_counts();

CREATE TRIGGER update_poll_counts_on_vote_delete
  AFTER DELETE ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_poll_counts();

-- Add updated_at triggers
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON public.polls
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for polls and poll_votes
ALTER TABLE public.polls REPLICA IDENTITY FULL;
ALTER TABLE public.poll_votes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;