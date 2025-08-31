-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  location JSONB,
  host_id UUID NOT NULL,
  participants UUID[] DEFAULT '{}',
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "Public groups are viewable by everyone" 
ON public.groups 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their groups" 
ON public.groups 
FOR SELECT 
USING (auth.uid() = host_id OR auth.uid() = ANY(participants));

CREATE POLICY "Users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their groups" 
ON public.groups 
FOR UPDATE 
USING (auth.uid() = host_id);

-- Create group_messages table
CREATE TABLE public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for group messages
CREATE POLICY "Group members can view messages" 
ON public.group_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.groups 
  WHERE groups.id = group_messages.group_id 
  AND (groups.host_id = auth.uid() OR auth.uid() = ANY(groups.participants))
));

CREATE POLICY "Group members can send messages" 
ON public.group_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND EXISTS (
    SELECT 1 FROM public.groups 
    WHERE groups.id = group_messages.group_id 
    AND (groups.host_id = auth.uid() OR auth.uid() = ANY(groups.participants))
  )
);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('group-avatars', 'group-avatars', true);

-- Storage policies for group avatars
CREATE POLICY "Group avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'group-avatars');

CREATE POLICY "Users can upload group avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'group-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update group avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'group-avatars' AND auth.uid() IS NOT NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_group_messages_updated_at
  BEFORE UPDATE ON public.group_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable realtime for group messages
ALTER TABLE public.group_messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.group_messages;