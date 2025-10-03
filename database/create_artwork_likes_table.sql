-- Create artwork_likes table for like functionality
-- =====================================================

-- Create artwork_likes table
CREATE TABLE IF NOT EXISTS public.artwork_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per artwork
    UNIQUE(artwork_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_artwork_likes_artwork_id ON public.artwork_likes(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_likes_user_id ON public.artwork_likes(user_id);

-- Enable RLS
ALTER TABLE public.artwork_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for artwork_likes
DROP POLICY IF EXISTS "Users can view all likes" ON public.artwork_likes;
CREATE POLICY "Users can view all likes" ON public.artwork_likes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own likes" ON public.artwork_likes;
CREATE POLICY "Users can manage their own likes" ON public.artwork_likes
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.storyweave_profiles 
      WHERE hekayaty_user_id = auth.uid()::text
    )
  );

-- Add like_count column to artworks if it doesn't exist
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Create function to update like count
CREATE OR REPLACE FUNCTION update_artwork_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.artworks 
    SET like_count = like_count + 1 
    WHERE id = NEW.artwork_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.artworks 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = OLD.artwork_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update like count
DROP TRIGGER IF EXISTS artwork_like_count_trigger ON public.artwork_likes;
CREATE TRIGGER artwork_like_count_trigger
  AFTER INSERT OR DELETE ON public.artwork_likes
  FOR EACH ROW EXECUTE FUNCTION update_artwork_like_count();
