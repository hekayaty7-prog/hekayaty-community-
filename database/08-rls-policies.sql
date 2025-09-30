-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- These policies ensure users can only access data they're authorized to see
-- and integrate with HEKAYATY's authentication system

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.storyweave_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Workshop tables
ALTER TABLE public.workshop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Book club tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_book_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_suggestion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;

-- Discussion tables
ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_submissions ENABLE ROW LEVEL SECURITY;

-- Art gallery tables
ALTER TABLE public.art_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_commissions ENABLE ROW LEVEL SECURITY;

-- Messaging and notification tables
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_interactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's StoryWeave profile ID from HEKAYATY user ID
CREATE OR REPLACE FUNCTION get_current_storyweave_user_id()
RETURNS UUID AS $$
BEGIN
    -- This would integrate with HEKAYATY's auth system
    -- For now, we'll use a placeholder that can be customized
    RETURN (
        SELECT id 
        FROM public.storyweave_profiles 
        WHERE hekayaty_user_id = current_setting('app.current_user_id', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin/moderator
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- This would check HEKAYATY's role system
    RETURN current_setting('app.user_role', true) IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- USER PROFILE POLICIES
-- =====================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable by everyone" ON public.storyweave_profiles
    FOR SELECT USING (
        profile_visibility = 'public' OR 
        id = get_current_storyweave_user_id() OR
        is_admin_user()
    );

-- Users can insert their own profile (handled by HEKAYATY integration)
CREATE POLICY "Users can insert their own profile" ON public.storyweave_profiles
    FOR INSERT WITH CHECK (true); -- Handled by backend integration

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.storyweave_profiles
    FOR UPDATE USING (id = get_current_storyweave_user_id());

-- =====================================================
-- WORKSHOP POLICIES
-- =====================================================

-- Workshop categories are viewable by everyone
CREATE POLICY "Workshop categories are public" ON public.workshop_categories
    FOR SELECT USING (is_active = true);

-- Workshops are viewable by everyone (unless private)
CREATE POLICY "Public workshops are viewable" ON public.workshops
    FOR SELECT USING (
        is_private = false OR 
        creator_id = get_current_storyweave_user_id() OR
        EXISTS (
            SELECT 1 FROM public.workshop_members 
            WHERE workshop_id = workshops.id 
            AND user_id = get_current_storyweave_user_id()
        ) OR
        is_admin_user()
    );

-- Authenticated users can create workshops
CREATE POLICY "Authenticated users can create workshops" ON public.workshops
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- Workshop creators can update their workshops
CREATE POLICY "Workshop creators can update" ON public.workshops
    FOR UPDATE USING (
        creator_id = get_current_storyweave_user_id() OR 
        is_admin_user()
    );

-- Workshop members can view member list
CREATE POLICY "Workshop members can view members" ON public.workshop_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workshops w 
            WHERE w.id = workshop_id 
            AND (w.is_private = false OR w.creator_id = get_current_storyweave_user_id())
        ) OR
        user_id = get_current_storyweave_user_id() OR
        EXISTS (
            SELECT 1 FROM public.workshop_members wm
            WHERE wm.workshop_id = workshop_members.workshop_id 
            AND wm.user_id = get_current_storyweave_user_id()
        )
    );

-- Users can join workshops
CREATE POLICY "Users can join workshops" ON public.workshop_members
    FOR INSERT WITH CHECK (user_id = get_current_storyweave_user_id());

-- Workshop projects visible to workshop members
CREATE POLICY "Workshop projects visible to members" ON public.workshop_projects
    FOR SELECT USING (
        author_id = get_current_storyweave_user_id() OR
        EXISTS (
            SELECT 1 FROM public.workshop_members 
            WHERE workshop_id = workshop_projects.workshop_id 
            AND user_id = get_current_storyweave_user_id()
        )
    );

-- =====================================================
-- BOOK CLUB POLICIES
-- =====================================================

-- Books are viewable by everyone
CREATE POLICY "Books are public" ON public.books
    FOR SELECT USING (is_available = true);

-- Book clubs visibility based on privacy settings
CREATE POLICY "Book clubs visibility" ON public.book_clubs
    FOR SELECT USING (
        is_private = false OR
        creator_id = get_current_storyweave_user_id() OR
        EXISTS (
            SELECT 1 FROM public.book_club_members 
            WHERE club_id = book_clubs.id 
            AND user_id = get_current_storyweave_user_id()
        ) OR
        is_admin_user()
    );

-- Authenticated users can create book clubs
CREATE POLICY "Users can create book clubs" ON public.book_clubs
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- Club creators can update their clubs
CREATE POLICY "Club creators can update" ON public.book_clubs
    FOR UPDATE USING (
        creator_id = get_current_storyweave_user_id() OR
        is_admin_user()
    );

-- Reading progress is private to user
CREATE POLICY "Reading progress is private" ON public.reading_progress
    FOR ALL USING (user_id = get_current_storyweave_user_id());

-- =====================================================
-- DISCUSSION POLICIES
-- =====================================================

-- Discussion categories are public
CREATE POLICY "Discussion categories are public" ON public.discussion_categories
    FOR SELECT USING (is_active = true);

-- Threads are viewable by everyone
CREATE POLICY "Threads are public" ON public.discussion_threads
    FOR SELECT USING (is_approved = true);

-- Authenticated users can create threads
CREATE POLICY "Authenticated users can create threads" ON public.discussion_threads
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- Users can update their own threads
CREATE POLICY "Users can update own threads" ON public.discussion_threads
    FOR UPDATE USING (
        author_id = get_current_storyweave_user_id() OR 
        is_admin_user()
    );

-- Thread replies are viewable by everyone
CREATE POLICY "Thread replies are public" ON public.thread_replies
    FOR SELECT USING (is_approved = true);

-- Authenticated users can create replies
CREATE POLICY "Authenticated users can reply" ON public.thread_replies
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- Users can update their own replies
CREATE POLICY "Users can update own replies" ON public.thread_replies
    FOR UPDATE USING (
        author_id = get_current_storyweave_user_id() OR 
        is_admin_user()
    );

-- Users can manage their own reactions
CREATE POLICY "Users can manage own reactions" ON public.content_reactions
    FOR ALL USING (user_id = get_current_storyweave_user_id());

-- =====================================================
-- ART GALLERY POLICIES
-- =====================================================

-- Art categories are public
CREATE POLICY "Art categories are public" ON public.art_categories
    FOR SELECT USING (is_active = true);

-- Artworks are viewable based on status and content rating
CREATE POLICY "Artworks are viewable" ON public.artworks
    FOR SELECT USING (
        status = 'published' AND 
        is_approved = true AND
        (is_nsfw = false OR get_current_storyweave_user_id() IS NOT NULL)
    );

-- Authenticated users can upload artworks
CREATE POLICY "Users can upload artworks" ON public.artworks
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- Artists can update their own artworks
CREATE POLICY "Artists can update own artworks" ON public.artworks
    FOR UPDATE USING (
        artist_id = get_current_storyweave_user_id() OR 
        is_admin_user()
    );

-- Artists can delete their own artworks
CREATE POLICY "Artists can delete own artworks" ON public.artworks
    FOR DELETE USING (
        artist_id = get_current_storyweave_user_id() OR 
        is_admin_user()
    );

-- Artwork reactions are manageable by users
CREATE POLICY "Users can manage artwork reactions" ON public.artwork_reactions
    FOR ALL USING (user_id = get_current_storyweave_user_id());

-- Artwork comments are viewable by everyone
CREATE POLICY "Artwork comments are public" ON public.artwork_comments
    FOR SELECT USING (is_approved = true AND is_hidden = false);

-- Authenticated users can comment on artworks
CREATE POLICY "Users can comment on artworks" ON public.artwork_comments
    FOR INSERT WITH CHECK (get_current_storyweave_user_id() IS NOT NULL);

-- =====================================================
-- MESSAGING POLICIES
-- =====================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON public.direct_messages
    FOR SELECT USING (
        sender_id = get_current_storyweave_user_id() OR 
        recipient_id = get_current_storyweave_user_id()
    );

-- Users can send messages
CREATE POLICY "Users can send messages" ON public.direct_messages
    FOR INSERT WITH CHECK (sender_id = get_current_storyweave_user_id());

-- Users can update their own messages (for read status, etc.)
CREATE POLICY "Users can update own messages" ON public.direct_messages
    FOR UPDATE USING (
        sender_id = get_current_storyweave_user_id() OR 
        recipient_id = get_current_storyweave_user_id()
    );

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON public.message_conversations
    FOR SELECT USING (
        participant_1_id = get_current_storyweave_user_id() OR 
        participant_2_id = get_current_storyweave_user_id()
    );

-- =====================================================
-- NOTIFICATION POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (recipient_id = get_current_storyweave_user_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (recipient_id = get_current_storyweave_user_id());

-- Users can manage their notification preferences
CREATE POLICY "Users can manage notification preferences" ON public.notification_preferences
    FOR ALL USING (user_id = get_current_storyweave_user_id());

-- =====================================================
-- ACTIVITY FEED POLICIES
-- =====================================================

-- Public activity is viewable by everyone
CREATE POLICY "Public activity is viewable" ON public.activity_feed
    FOR SELECT USING (
        is_public = true OR 
        user_id = get_current_storyweave_user_id() OR
        (visibility_level = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows 
            WHERE following_user_id = activity_feed.user_id 
            AND follower_id = get_current_storyweave_user_id()
        ))
    );

-- Users can create their own activity
CREATE POLICY "Users can create own activity" ON public.activity_feed
    FOR INSERT WITH CHECK (user_id = get_current_storyweave_user_id());

-- =====================================================
-- ADMIN POLICIES
-- =====================================================

-- Admins can view announcements
CREATE POLICY "Announcements are viewable" ON public.announcements
    FOR SELECT USING (
        is_published = true AND 
        (publish_at <= NOW()) AND 
        (expires_at IS NULL OR expires_at > NOW()) AND
        (target_audience = 'all' OR is_admin_user())
    );

-- Only admins can manage announcements
CREATE POLICY "Only admins can manage announcements" ON public.announcements
    FOR ALL USING (is_admin_user());
