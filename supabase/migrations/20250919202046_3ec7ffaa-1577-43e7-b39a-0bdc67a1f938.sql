-- Create moment_stories table for user-generated content
CREATE TABLE public.moment_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moment_stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view stories of accessible moments" 
ON public.moment_stories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM moments 
    WHERE id = moment_stories.moment_id 
    AND (is_public = true OR host_id = auth.uid() OR auth.uid() = ANY(participants))
  )
);

CREATE POLICY "Participants can create stories" 
ON public.moment_stories 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM moments 
    WHERE id = moment_stories.moment_id 
    AND (host_id = auth.uid() OR auth.uid() = ANY(participants))
  )
);

CREATE POLICY "Users can update their own stories" 
ON public.moment_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.moment_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create reactions table for moments
CREATE TABLE public.moment_reactions_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moment_id UUID NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('hearts', 'likes', 'stars', 'fire')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(moment_id, user_id) -- One reaction per user per moment
);

-- Enable RLS
ALTER TABLE public.moment_reactions_detailed ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view reactions on accessible moments" 
ON public.moment_reactions_detailed 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM moments 
    WHERE id = moment_reactions_detailed.moment_id 
    AND (is_public = true OR host_id = auth.uid() OR auth.uid() = ANY(participants))
  )
);

CREATE POLICY "Users can create their own reactions" 
ON public.moment_reactions_detailed 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" 
ON public.moment_reactions_detailed 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" 
ON public.moment_reactions_detailed 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_moment_stories_updated_at
BEFORE UPDATE ON public.moment_stories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create index for better performance
CREATE INDEX idx_moment_stories_moment_id ON public.moment_stories(moment_id);
CREATE INDEX idx_moment_stories_user_id ON public.moment_stories(user_id);
CREATE INDEX idx_moment_reactions_detailed_moment_id ON public.moment_reactions_detailed(moment_id);
CREATE INDEX idx_moment_reactions_detailed_user_id ON public.moment_reactions_detailed(user_id);