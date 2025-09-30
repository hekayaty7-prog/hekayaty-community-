-- =====================================================
-- HEKAYATY StoryWeaveConnect - Complete Database Schema
-- =====================================================
-- Run this file in order to create all tables with proper dependencies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER PROFILES (Base table - no dependencies)
-- =====================================================

CREATE TABLE public.storyweave_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hekayaty_user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    location VARCHAR(100),
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    
    -- Writing preferences
    writing_genres TEXT[] DEFAULT '{}',
    favorite_authors TEXT[] DEFAULT '{}',
    writing_experience VARCHAR(20) DEFAULT 'beginner',
    writing_goals TEXT,
    
    -- Reading preferences  
    reading_genres TEXT[] DEFAULT '{}',
    reading_goal_yearly INTEGER DEFAULT 12,
    current_reading_streak INTEGER DEFAULT 0,
    
    -- Community stats
    total_points INTEGER DEFAULT 0,
    community_level INTEGER DEFAULT 1,
    reputation_score INTEGER DEFAULT 0,
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public',
    show_reading_activity BOOLEAN DEFAULT TRUE,
    show_writing_progress BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ACHIEVEMENTS SYSTEM
-- =====================================================

CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common',
    points_reward INTEGER DEFAULT 0,
    requirements JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB,
    UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BOOKS SYSTEM (Independent table)
-- =====================================================

CREATE TABLE public.books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    author VARCHAR(300),
    co_authors TEXT[],
    isbn_10 VARCHAR(10),
    isbn_13 VARCHAR(13),
    publisher VARCHAR(200),
    published_date DATE,
    edition VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    page_count INTEGER,
    word_count INTEGER,
    chapter_count INTEGER,
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    age_rating VARCHAR(20),
    content_warnings TEXT[],
    description TEXT,
    summary TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    cover_thumbnail_url TEXT,
    goodreads_id VARCHAR(50),
    amazon_asin VARCHAR(20),
    google_books_id VARCHAR(50),
    open_library_id VARCHAR(50),
    average_rating DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    availability_status VARCHAR(30) DEFAULT 'available',
    series_name VARCHAR(300),
    series_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CATEGORIES (Independent tables)
-- =====================================================

CREATE TABLE public.discussion_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    min_reputation_to_post INTEGER DEFAULT 0,
    parent_category_id UUID REFERENCES public.discussion_categories(id),
    sort_order INTEGER DEFAULT 0,
    thread_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.workshop_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.art_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    parent_category_id UUID REFERENCES public.art_categories(id),
    sort_order INTEGER DEFAULT 0,
    artwork_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. DISCUSSION THREADS SYSTEM
-- =====================================================

CREATE TABLE public.discussion_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.discussion_categories(id) ON DELETE SET NULL,
    thread_type VARCHAR(20) DEFAULT 'discussion',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    spoiler_tags TEXT[],
    content_rating VARCHAR(20) DEFAULT 'general',
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0.00,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID REFERENCES public.storyweave_profiles(id),
    is_approved BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES public.storyweave_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.thread_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown',
    contains_spoilers BOOLEAN DEFAULT FALSE,
    spoiler_warning TEXT,
    like_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    reply_depth INTEGER DEFAULT 0,
    reply_path TEXT,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    edit_reason TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. WORKSHOPS SYSTEM
-- =====================================================

CREATE TABLE public.workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.workshop_categories(id) ON DELETE SET NULL,
    genre VARCHAR(100),
    target_words INTEGER,
    duration_weeks INTEGER DEFAULT 12,
    timeline TEXT,
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 1,
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    workshop_type VARCHAR(30) DEFAULT 'collaborative',
    meeting_schedule JSONB,
    resources JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'recruiting',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    requirements TEXT,
    guidelines TEXT,
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.workshop_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'participant',
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_count INTEGER DEFAULT 0,
    words_contributed INTEGER DEFAULT 0,
    feedback_given_count INTEGER DEFAULT 0,
    feedback_received_count INTEGER DEFAULT 0,
    personal_goal TEXT,
    progress_notes TEXT,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    UNIQUE(workshop_id, user_id)
);

-- =====================================================
-- 7. BOOK CLUBS SYSTEM
-- =====================================================

CREATE TABLE public.book_clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    current_book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    reading_start_date DATE,
    reading_end_date DATE,
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 50,
    current_member_count INTEGER DEFAULT 1,
    preferred_genres TEXT[] DEFAULT '{}',
    reading_pace VARCHAR(20) DEFAULT 'moderate',
    meeting_frequency VARCHAR(20) DEFAULT 'weekly',
    meeting_day VARCHAR(10),
    meeting_time TIME,
    meeting_timezone VARCHAR(50) DEFAULT 'UTC',
    meeting_platform VARCHAR(50),
    meeting_url TEXT,
    cover_image_url TEXT,
    banner_image_url TEXT,
    club_color VARCHAR(7) DEFAULT '#6366f1',
    status VARCHAR(20) DEFAULT 'active',
    activity_level VARCHAR(20) DEFAULT 'moderate',
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_books_read INTEGER DEFAULT 0,
    total_discussions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.book_club_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    status VARCHAR(20) DEFAULT 'active',
    notification_preferences JSONB DEFAULT '{"new_books": true, "discussions": true, "meetings": true}',
    reading_goals JSONB,
    books_read_count INTEGER DEFAULT 0,
    discussions_started INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    meetings_attended INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- =====================================================
-- 8. ART GALLERY SYSTEM
-- =====================================================

CREATE TABLE public.artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.art_categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    high_res_url TEXT,
    file_size INTEGER,
    file_format VARCHAR(10),
    dimensions JSONB,
    color_palette JSONB,
    medium VARCHAR(100),
    technique VARCHAR(100),
    software_used VARCHAR(100),
    creation_time_hours INTEGER,
    story_context TEXT,
    character_names TEXT[],
    setting_description TEXT,
    inspiration_sources TEXT[],
    tags TEXT[] DEFAULT '{}',
    style_tags TEXT[] DEFAULT '{}',
    mood_tags TEXT[] DEFAULT '{}',
    content_rating VARCHAR(20) DEFAULT 'general',
    content_warnings TEXT[],
    is_nsfw BOOLEAN DEFAULT FALSE,
    license_type VARCHAR(50) DEFAULT 'all_rights_reserved',
    allows_commercial_use BOOLEAN DEFAULT FALSE,
    allows_modifications BOOLEAN DEFAULT FALSE,
    attribution_required BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    featured_score DECIMAL(5,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMP WITH TIME ZONE,
    curator_notes TEXT,
    status VARCHAR(20) DEFAULT 'published',
    is_approved BOOLEAN DEFAULT TRUE,
    moderation_notes TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. MESSAGING & NOTIFICATIONS
-- =====================================================

CREATE TABLE public.direct_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    attachments JSONB DEFAULT '[]',
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    conversation_id UUID,
    reply_to_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    action_url TEXT,
    action_text VARCHAR(100),
    related_thread_id UUID,
    related_workshop_id UUID,
    related_club_id UUID,
    related_artwork_id UUID,
    related_book_id UUID,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal',
    group_key VARCHAR(100),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_storyweave_profiles_updated_at 
    BEFORE UPDATE ON public.storyweave_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_threads_updated_at 
    BEFORE UPDATE ON public.discussion_threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workshops_updated_at 
    BEFORE UPDATE ON public.workshops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_clubs_updated_at 
    BEFORE UPDATE ON public.book_clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artworks_updated_at 
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. INITIAL DATA
-- =====================================================

-- Insert default discussion categories
INSERT INTO public.discussion_categories (name, description, color, icon) VALUES
('General Discussion', 'General community discussions', '#6366f1', 'MessageCircle'),
('Writing Help', 'Get help with your writing', '#10b981', 'PenTool'),
('Book Recommendations', 'Share and discover great books', '#f59e0b', 'BookOpen'),
('Publishing & Marketing', 'Discuss publishing and marketing strategies', '#8b5cf6', 'TrendingUp'),
('Writing Prompts', 'Creative writing prompts and challenges', '#ef4444', 'Lightbulb'),
('Feedback Exchange', 'Exchange feedback on writing projects', '#06b6d4', 'MessageSquare');

-- Insert default workshop categories
INSERT INTO public.workshop_categories (name, description, icon) VALUES
('Fiction Writing', 'Novel and short story workshops', 'BookOpen'),
('Poetry', 'Poetry writing and critique', 'Feather'),
('Screenwriting', 'Script and screenplay workshops', 'Film'),
('Non-Fiction', 'Essays, memoirs, and articles', 'FileText'),
('Creative Writing', 'General creative writing exercises', 'Edit3'),
('Genre Fiction', 'Fantasy, sci-fi, mystery, and more', 'Zap');

-- Insert default art categories
INSERT INTO public.art_categories (name, description) VALUES
('Book Covers', 'Book cover designs and artwork'),
('Character Art', 'Character illustrations and designs'),
('Landscapes', 'Environmental and landscape artwork'),
('Portraits', 'Character portraits and headshots'),
('Digital Art', 'Digital illustrations and designs'),
('Traditional Art', 'Traditional media artwork');

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, rarity, points_reward) VALUES
('Welcome!', 'Joined the StoryWeave community', 'star', 'community', 'common', 10),
('First Post', 'Created your first discussion thread', 'message-circle', 'community', 'common', 25),
('Helpful', 'Received 10 likes on comments', 'thumbs-up', 'community', 'common', 50),
('Book Lover', 'Joined your first book club', 'book-open', 'reading', 'common', 25),
('Workshop Participant', 'Joined your first writing workshop', 'edit-3', 'writing', 'common', 25),
('Artist', 'Uploaded your first artwork', 'image', 'community', 'common', 25),
('Popular Thread', 'Created a thread with 100+ views', 'eye', 'community', 'rare', 100),
('Prolific Writer', 'Completed 5 workshop projects', 'pen-tool', 'writing', 'rare', 200);
