-- Fix artwork categories and ensure proper setup
-- =====================================================

-- Insert default art categories if they don't exist
INSERT INTO public.art_categories (name, description, icon, color, is_active)
SELECT 'Digital Art', 'Digital artwork and illustrations', 'monitor', '#6366f1', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Digital Art')
UNION ALL
SELECT 'Painting', 'Traditional and digital paintings', 'palette', '#f59e0b', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Painting')
UNION ALL
SELECT 'Photography', 'Photography and photo manipulation', 'camera', '#10b981', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Photography')
UNION ALL
SELECT 'Sculpture', '3D art and sculptures', 'box', '#8b5cf6', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Sculpture')
UNION ALL
SELECT 'Abstract', 'Abstract and conceptual art', 'circle', '#ef4444', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Abstract')
UNION ALL
SELECT 'Portrait', 'Character and portrait art', 'user', '#06b6d4', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Portrait')
UNION ALL
SELECT 'Landscape', 'Environment and landscape art', 'mountain', '#84cc16', true
WHERE NOT EXISTS (SELECT 1 FROM public.art_categories WHERE name = 'Landscape');

-- Ensure RLS is enabled on artworks table
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read all artworks
DROP POLICY IF EXISTS "Users can view all artworks" ON public.artworks;
CREATE POLICY "Users can view all artworks" ON public.artworks
  FOR SELECT USING (true);

-- Create policy to allow users to insert their own artworks
DROP POLICY IF EXISTS "Users can insert their own artworks" ON public.artworks;
CREATE POLICY "Users can insert their own artworks" ON public.artworks
  FOR INSERT WITH CHECK (
    artist_id IN (
      SELECT id FROM public.storyweave_profiles 
      WHERE hekayaty_user_id = auth.uid()::text
    )
  );

-- Create policy to allow users to update their own artworks
DROP POLICY IF EXISTS "Users can update their own artworks" ON public.artworks;
CREATE POLICY "Users can update their own artworks" ON public.artworks
  FOR UPDATE USING (
    artist_id IN (
      SELECT id FROM public.storyweave_profiles 
      WHERE hekayaty_user_id = auth.uid()::text
    )
  );

-- Create policy to allow users to delete their own artworks
DROP POLICY IF EXISTS "Users can delete their own artworks" ON public.artworks;
CREATE POLICY "Users can delete their own artworks" ON public.artworks
  FOR DELETE USING (
    artist_id IN (
      SELECT id FROM public.storyweave_profiles 
      WHERE hekayaty_user_id = auth.uid()::text
    )
  );
