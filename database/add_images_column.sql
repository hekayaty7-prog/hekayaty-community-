-- =====================================================
-- ADD IMAGES COLUMN TO DISCUSSION_THREADS TABLE
-- =====================================================
-- Run this in your Supabase SQL Editor to add image support

-- Add images column to discussion_threads table
ALTER TABLE public.discussion_threads 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Add comment to document the column
COMMENT ON COLUMN public.discussion_threads.images IS 'Array of Cloudinary image URLs for the discussion thread';

-- Create index for better performance when filtering by images
CREATE INDEX IF NOT EXISTS idx_discussion_threads_images ON public.discussion_threads USING GIN(images);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Images column added to discussion_threads table successfully!';
    RAISE NOTICE '📸 Discussion threads can now store multiple images.';
END $$;
