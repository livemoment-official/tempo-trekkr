-- Update reaction_type constraints to support frontend values and keep backward compatibility

-- Drop existing check constraints if they exist
ALTER TABLE public.moment_reactions
  DROP CONSTRAINT IF EXISTS moment_reactions_reaction_type_check;

ALTER TABLE public.moment_reactions_detailed
  DROP CONSTRAINT IF EXISTS moment_reactions_detailed_reaction_type_check;

-- Recreate constraints with extended allowed set (includes existing and new frontend values)
ALTER TABLE public.moment_reactions
  ADD CONSTRAINT moment_reactions_reaction_type_check
  CHECK (reaction_type = ANY (ARRAY[
    'heart', 'fire', 'star', 'thumbs_up',         -- existing
    'idea', 'star_eyes', 'yellow_heart'           -- new frontend values
  ]));

ALTER TABLE public.moment_reactions_detailed
  ADD CONSTRAINT moment_reactions_detailed_reaction_type_check
  CHECK (reaction_type = ANY (ARRAY[
    'hearts', 'likes', 'stars', 'fire',           -- existing (plural variants)
    'idea', 'star_eyes', 'yellow_heart',          -- new frontend values
    'heart', 'star', 'thumbs_up'                  -- include singulars for compatibility
  ]));