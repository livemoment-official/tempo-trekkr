-- Create RLS policies for polls table
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

-- Create RLS policies for poll_votes table  
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