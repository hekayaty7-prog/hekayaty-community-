-- =====================================================
-- CLEAR TEST DATA FROM DATABASE (OPTIONAL)
-- =====================================================
-- ⚠️  WARNING: This will delete ALL data from your tables!
-- Only run this if you want to start fresh

-- Uncomment the lines below if you want to clear test data:

-- Clear discussion threads and replies
-- DELETE FROM thread_replies;
-- DELETE FROM discussion_threads;

-- Clear artworks
-- DELETE FROM artworks;

-- Clear workshops and related data
-- DELETE FROM workshop_messages;
-- DELETE FROM workshop_members;
-- DELETE FROM workshops;

-- Clear book clubs and related data
-- DELETE FROM book_club_members;
-- DELETE FROM book_clubs;

-- Clear user activities (optional)
-- DELETE FROM user_activities;

-- Clear notifications (optional)
-- DELETE FROM notifications;

-- Reset auto-increment sequences (if using SERIAL)
-- ALTER SEQUENCE discussion_threads_id_seq RESTART WITH 1;
-- ALTER SEQUENCE artworks_id_seq RESTART WITH 1;
-- ALTER SEQUENCE workshops_id_seq RESTART WITH 1;
-- ALTER SEQUENCE book_clubs_id_seq RESTART WITH 1;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '⚠️  Test data clearing script prepared.';
    RAISE NOTICE '📝 Uncomment the DELETE statements above to clear data.';
    RAISE NOTICE '🔒 All statements are commented for safety.';
END $$;
