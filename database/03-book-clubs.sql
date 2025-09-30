-- =====================================================
-- BOOK CLUBS SYSTEM
-- =====================================================

-- Books database
CREATE TABLE public.books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic book information
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    author VARCHAR(300),
    co_authors TEXT[],
    isbn_10 VARCHAR(10),
    isbn_13 VARCHAR(13),
    
    -- Publication details
    publisher VARCHAR(200),
    published_date DATE,
    edition VARCHAR(100),
    language VARCHAR(10) DEFAULT 'en',
    
    -- Book content details
    page_count INTEGER,
    word_count INTEGER,
    chapter_count INTEGER,
    
    -- Categorization
    genres TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    age_rating VARCHAR(20), -- 'all_ages', 'teen', 'mature', 'adult'
    content_warnings TEXT[],
    
    -- Book description and metadata
    description TEXT,
    summary TEXT,
    excerpt TEXT,
    
    -- Visual assets
    cover_image_url TEXT,
    cover_thumbnail_url TEXT,
    
    -- External references
    goodreads_id VARCHAR(50),
    amazon_asin VARCHAR(20),
    google_books_id VARCHAR(50),
    open_library_id VARCHAR(50),
    
    -- Ratings and reviews
    average_rating DECIMAL(3,2),
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    availability_status VARCHAR(30) DEFAULT 'available', -- 'available', 'coming_soon', 'out_of_print'
    
    -- Series information
    series_name VARCHAR(300),
    series_position INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book clubs
CREATE TABLE public.book_clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic club information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Current reading
    current_book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
    reading_start_date DATE,
    reading_end_date DATE,
    
    -- Club settings
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    max_members INTEGER DEFAULT 50,
    current_member_count INTEGER DEFAULT 1,
    
    -- Club preferences
    preferred_genres TEXT[] DEFAULT '{}',
    reading_pace VARCHAR(20) DEFAULT 'moderate', -- 'slow', 'moderate', 'fast'
    meeting_frequency VARCHAR(20) DEFAULT 'weekly', -- 'weekly', 'biweekly', 'monthly'
    
    -- Meeting information
    meeting_day VARCHAR(10), -- 'monday', 'tuesday', etc.
    meeting_time TIME,
    meeting_timezone VARCHAR(50) DEFAULT 'UTC',
    meeting_platform VARCHAR(50), -- 'discord', 'zoom', 'in_person', etc.
    meeting_url TEXT,
    
    -- Club image and branding
    cover_image_url TEXT,
    banner_image_url TEXT,
    club_color VARCHAR(7) DEFAULT '#6366f1',
    
    -- Status and activity
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed', 'archived'
    activity_level VARCHAR(20) DEFAULT 'moderate', -- 'low', 'moderate', 'high'
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Club statistics
    total_books_read INTEGER DEFAULT 0,
    total_discussions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book club memberships
CREATE TABLE public.book_club_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Membership details
    role VARCHAR(20) DEFAULT 'member', -- 'creator', 'moderator', 'member'
    status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'inactive', 'banned'
    
    -- Member preferences
    notification_preferences JSONB DEFAULT '{"new_books": true, "discussions": true, "meetings": true}',
    reading_goals JSONB,
    
    -- Member activity
    books_read_count INTEGER DEFAULT 0,
    discussions_started INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    meetings_attended INTEGER DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(club_id, user_id)
);

-- Book club reading history
CREATE TABLE public.club_reading_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    
    -- Reading period
    started_reading_at DATE NOT NULL,
    finished_reading_at DATE,
    planned_finish_date DATE,
    
    -- Reading details
    reading_schedule JSONB, -- Weekly goals, chapter breakdowns
    discussion_schedule JSONB, -- When discussions are planned
    
    -- Participation stats
    member_count_at_start INTEGER,
    completion_rate DECIMAL(5,2), -- Percentage of members who finished
    average_rating DECIMAL(3,2),
    total_discussions INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'current', -- 'planned', 'current', 'completed', 'abandoned'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual reading progress
CREATE TABLE public.reading_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_page INTEGER DEFAULT 0,
    total_pages INTEGER,
    current_chapter INTEGER DEFAULT 0,
    total_chapters INTEGER,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Reading status
    status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'reading', 'completed', 'paused', 'dnf'
    reading_format VARCHAR(20) DEFAULT 'physical', -- 'physical', 'ebook', 'audiobook', 'mixed'
    
    -- Personal notes and tracking
    personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
    personal_review TEXT,
    private_notes TEXT,
    favorite_quotes TEXT[],
    
    -- Reading sessions
    total_reading_time INTEGER DEFAULT 0, -- in minutes
    reading_sessions_count INTEGER DEFAULT 0,
    
    -- Timestamps
    started_reading_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    target_completion_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, book_id, club_id)
);

-- Reading sessions (detailed tracking)
CREATE TABLE public.reading_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    progress_id UUID REFERENCES public.reading_progress(id) ON DELETE CASCADE,
    
    -- Session details
    pages_read INTEGER DEFAULT 0,
    chapters_read INTEGER DEFAULT 0,
    reading_time_minutes INTEGER DEFAULT 0,
    
    -- Session notes
    session_notes TEXT,
    mood_before VARCHAR(20), -- 'excited', 'neutral', 'tired', etc.
    mood_after VARCHAR(20),
    
    -- Location and context
    reading_location VARCHAR(100),
    reading_format VARCHAR(20), -- 'physical', 'ebook', 'audiobook'
    
    session_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book club discussions (extends general discussion system)
CREATE TABLE public.club_discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Discussion details
    title VARCHAR(255) NOT NULL,
    content TEXT,
    discussion_type VARCHAR(30) DEFAULT 'general', -- 'general', 'chapter', 'character', 'theme', 'spoiler'
    
    -- Content scope
    chapter_start INTEGER,
    chapter_end INTEGER,
    page_start INTEGER,
    page_end INTEGER,
    spoiler_level VARCHAR(20) DEFAULT 'none', -- 'none', 'minor', 'major', 'ending'
    
    -- Discussion settings
    allows_spoilers BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    
    -- Engagement stats
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- Timestamps
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion replies/comments
CREATE TABLE public.discussion_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES public.club_discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
    
    -- Reply content
    content TEXT NOT NULL,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    spoiler_warning TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    
    -- Editing
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book recommendations within clubs
CREATE TABLE public.club_book_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    suggested_by UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Suggestion details
    reason TEXT,
    priority_level VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Voting
    vote_count INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'reading', 'completed'
    
    -- Scheduling
    suggested_start_date DATE,
    estimated_duration_weeks INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voting on book suggestions
CREATE TABLE public.book_suggestion_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    suggestion_id UUID REFERENCES public.club_book_suggestions(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
    comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(suggestion_id, voter_id)
);

-- Book club events and meetings
CREATE TABLE public.club_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES public.book_clubs(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(30) DEFAULT 'discussion', -- 'discussion', 'meeting', 'social', 'author_qa'
    
    -- Timing
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Virtual meeting details
    meeting_url TEXT,
    meeting_password TEXT,
    meeting_platform VARCHAR(50),
    
    -- Event settings
    max_attendees INTEGER,
    requires_rsvp BOOLEAN DEFAULT FALSE,
    is_members_only BOOLEAN DEFAULT TRUE,
    
    -- Related content
    related_book_id UUID REFERENCES public.books(id),
    discussion_topics TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
