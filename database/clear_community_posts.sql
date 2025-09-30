-- =====================================================
-- CLEAR COMMUNITY POSTS FROM DATABASE
-- =====================================================
-- This will safely delete posts from your community

-- Clear discussion thread replies first (foreign key constraint)
DELETE FROM thread_replies;

-- Clear discussion threads
DELETE FROM discussion_threads;

-- Clear workshop messages
DELETE FROM workshop_messages;

-- Clear workshop members (except creators will be re-added)
DELETE FROM workshop_members;

-- Clear workshops
DELETE FROM workshops;

-- Clear book club members
DELETE FROM book_club_members;

-- Clear book clubs
DELETE FROM book_clubs;

-- Clear artworks
DELETE FROM artworks;

-- Clear user activities related to posts
DELETE FROM user_activities 
WHERE activity_type IN (
  'thread_comment', 
  'thread_created', 
  'artwork_uploaded', 
  'workshop_created', 
  'workshop_joined',
  'book_club_created',
  'book_club_joined'
);

-- Clear notifications related to posts
DELETE FROM notifications 
WHERE type IN ('like', 'comment', 'workshop_invite');

-- Reset sequences if they exist (for auto-increment IDs)
-- Note: Only run these if your tables use SERIAL/auto-increment
-- SELECT setval('discussion_threads_id_seq', 1, false);
-- SELECT setval('thread_replies_id_seq', 1, false);
-- SELECT setval('workshops_id_seq', 1, false);
-- SELECT setval('book_clubs_id_seq', 1, false);
-- SELECT setval('artworks_id_seq', 1, false);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Community posts cleared successfully!';
    RAISE NOTICE '🏠 Your community is now clean and ready for fresh content.';
    RAISE NOTICE '👥 User profiles and authentication data preserved.';
END $$;
