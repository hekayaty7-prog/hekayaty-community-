-- =====================================================
-- FIX FOREIGN KEY CONSTRAINTS
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Drop the old foreign key constraint that points to storyweave_profiles
ALTER TABLE workshops 
DROP CONSTRAINT IF EXISTS workshops_creator_id_fkey;

-- Add new foreign key constraint that points to user_profiles
ALTER TABLE workshops 
ADD CONSTRAINT workshops_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Fix other tables that might have the same issue
ALTER TABLE discussion_threads 
DROP CONSTRAINT IF EXISTS discussion_threads_author_id_fkey;

ALTER TABLE discussion_threads 
ADD CONSTRAINT discussion_threads_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE artworks 
DROP CONSTRAINT IF EXISTS artworks_artist_id_fkey;

ALTER TABLE artworks 
ADD CONSTRAINT artworks_artist_id_fkey 
FOREIGN KEY (artist_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

ALTER TABLE book_clubs 
DROP CONSTRAINT IF EXISTS book_clubs_creator_id_fkey;

ALTER TABLE book_clubs 
ADD CONSTRAINT book_clubs_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Foreign key constraints fixed!';
    RAISE NOTICE '🎯 Workshop creation should now work properly.';
END $$;
