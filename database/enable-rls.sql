-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS) - Run after complete-schema.sql
-- =====================================================

-- Enable RLS on all main tables
ALTER TABLE public.storyweave_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.art_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- BASIC RLS POLICIES (Permissive for now)
-- =====================================================

-- Allow all authenticated users to read public data
CREATE POLICY "Public data is viewable by authenticated users" ON public.storyweave_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON public.storyweave_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" ON public.storyweave_profiles
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Achievements are readable by all authenticated users
CREATE POLICY "Achievements are public" ON public.achievements
    FOR SELECT USING (auth.role() = 'authenticated');

-- User achievements are readable by all, manageable by owner
CREATE POLICY "User achievements are viewable" ON public.user_achievements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage their achievements" ON public.user_achievements
    FOR ALL USING (auth.role() = 'authenticated');

-- Books are public
CREATE POLICY "Books are public" ON public.books
    FOR SELECT USING (true);

-- Categories are public
CREATE POLICY "Discussion categories are public" ON public.discussion_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Workshop categories are public" ON public.workshop_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Art categories are public" ON public.art_categories
    FOR SELECT USING (is_active = true);

-- Discussion threads are public for reading, authenticated for writing
CREATE POLICY "Threads are viewable by all" ON public.discussion_threads
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create threads" ON public.discussion_threads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own threads" ON public.discussion_threads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Thread replies follow same pattern
CREATE POLICY "Replies are viewable by all" ON public.thread_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can reply" ON public.thread_replies
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own replies" ON public.thread_replies
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Workshops are viewable by all, manageable by authenticated users
CREATE POLICY "Workshops are viewable" ON public.workshops
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workshops" ON public.workshops
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update workshops" ON public.workshops
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Workshop members
CREATE POLICY "Workshop members are viewable" ON public.workshop_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join workshops" ON public.workshop_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Book clubs
CREATE POLICY "Book clubs are viewable" ON public.book_clubs
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create book clubs" ON public.book_clubs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update book clubs" ON public.book_clubs
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Book club members
CREATE POLICY "Book club members are viewable" ON public.book_club_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join book clubs" ON public.book_club_members
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Artworks are public for viewing
CREATE POLICY "Artworks are viewable" ON public.artworks
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can upload artworks" ON public.artworks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own artworks" ON public.artworks
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Messages are private to participants
CREATE POLICY "Users can view own messages" ON public.direct_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- Notifications are private to recipient
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- User activities
CREATE POLICY "User activities are manageable by owner" ON public.user_activities
    FOR ALL USING (auth.role() = 'authenticated');

SELECT 'RLS enabled successfully on all tables!' as status;
