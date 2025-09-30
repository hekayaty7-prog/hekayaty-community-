-- =====================================================
-- CLEANUP SCRIPT - Run this BEFORE complete-schema.sql
-- =====================================================
-- This will drop all existing tables so you can start fresh

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.artworks CASCADE;
DROP TABLE IF EXISTS public.art_categories CASCADE;
DROP TABLE IF EXISTS public.book_club_members CASCADE;
DROP TABLE IF EXISTS public.book_clubs CASCADE;
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.workshop_members CASCADE;
DROP TABLE IF EXISTS public.workshops CASCADE;
DROP TABLE IF EXISTS public.workshop_categories CASCADE;
DROP TABLE IF EXISTS public.thread_replies CASCADE;
DROP TABLE IF EXISTS public.discussion_threads CASCADE;
DROP TABLE IF EXISTS public.discussion_categories CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.storyweave_profiles CASCADE;

-- Drop any additional tables that might exist
DROP TABLE IF EXISTS public.artwork_reactions CASCADE;
DROP TABLE IF EXISTS public.artwork_views CASCADE;
DROP TABLE IF EXISTS public.artwork_comments CASCADE;
DROP TABLE IF EXISTS public.comment_reactions CASCADE;
DROP TABLE IF EXISTS public.art_collections CASCADE;
DROP TABLE IF EXISTS public.collection_artworks CASCADE;
DROP TABLE IF EXISTS public.art_challenges CASCADE;
DROP TABLE IF EXISTS public.challenge_submissions CASCADE;
DROP TABLE IF EXISTS public.challenge_votes CASCADE;
DROP TABLE IF EXISTS public.artist_portfolios CASCADE;
DROP TABLE IF EXISTS public.portfolio_artworks CASCADE;
DROP TABLE IF EXISTS public.art_commissions CASCADE;
DROP TABLE IF EXISTS public.reading_progress CASCADE;
DROP TABLE IF EXISTS public.reading_sessions CASCADE;
DROP TABLE IF EXISTS public.club_reading_history CASCADE;
DROP TABLE IF EXISTS public.club_discussions CASCADE;
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
DROP TABLE IF EXISTS public.club_book_suggestions CASCADE;
DROP TABLE IF EXISTS public.book_suggestion_votes CASCADE;
DROP TABLE IF EXISTS public.club_events CASCADE;
DROP TABLE IF EXISTS public.workshop_projects CASCADE;
DROP TABLE IF EXISTS public.workshop_feedback CASCADE;
DROP TABLE IF EXISTS public.workshop_assignments CASCADE;
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.workshop_messages CASCADE;
DROP TABLE IF EXISTS public.workshop_events CASCADE;
DROP TABLE IF EXISTS public.workshop_event_rsvps CASCADE;
DROP TABLE IF EXISTS public.content_reactions CASCADE;
DROP TABLE IF EXISTS public.thread_views CASCADE;
DROP TABLE IF EXISTS public.user_bookmarks CASCADE;
DROP TABLE IF EXISTS public.user_follows CASCADE;
DROP TABLE IF EXISTS public.thread_polls CASCADE;
DROP TABLE IF EXISTS public.poll_options CASCADE;
DROP TABLE IF EXISTS public.poll_votes CASCADE;
DROP TABLE IF EXISTS public.writing_prompts CASCADE;
DROP TABLE IF EXISTS public.prompt_submissions CASCADE;
DROP TABLE IF EXISTS public.message_conversations CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.activity_feed CASCADE;
DROP TABLE IF EXISTS public.user_mentions CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.announcement_interactions CASCADE;
DROP TABLE IF EXISTS public.email_queue CASCADE;
DROP TABLE IF EXISTS public.push_tokens CASCADE;
DROP TABLE IF EXISTS public.content_reports CASCADE;
DROP TABLE IF EXISTS public.user_blocks CASCADE;
DROP TABLE IF EXISTS public.platform_settings CASCADE;

-- Drop any functions that might exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_unique_username(TEXT) CASCADE;
DROP FUNCTION IF EXISTS calculate_reading_progress(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS update_thread_activity() CASCADE;
DROP FUNCTION IF EXISTS update_content_likes() CASCADE;
DROP FUNCTION IF EXISTS update_artwork_counts() CASCADE;
DROP FUNCTION IF EXISTS update_workshop_member_count() CASCADE;
DROP FUNCTION IF EXISTS update_club_member_count() CASCADE;
DROP FUNCTION IF EXISTS create_notification(UUID, UUID, VARCHAR(50), VARCHAR(255), TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_current_storyweave_user_id() CASCADE;
DROP FUNCTION IF EXISTS is_admin_user() CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Success message
SELECT 'All tables and functions dropped successfully. You can now run complete-schema.sql' as status;
