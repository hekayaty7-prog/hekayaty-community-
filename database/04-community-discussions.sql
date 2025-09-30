-- =====================================================
-- COMMUNITY DISCUSSIONS & FORUMS
-- =====================================================

-- Discussion categories
CREATE TABLE public.discussion_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366f1',
    
    -- Category settings
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    min_reputation_to_post INTEGER DEFAULT 0,
    
    -- Organization
    parent_category_id UUID REFERENCES public.discussion_categories(id),
    sort_order INTEGER DEFAULT 0,
    
    -- Stats
    thread_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussion threads
CREATE TABLE public.discussion_threads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.discussion_categories(id) ON DELETE SET NULL,
    
    -- Thread type and properties
    thread_type VARCHAR(20) DEFAULT 'discussion', -- 'discussion', 'question', 'announcement', 'poll'
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Content flags
    contains_spoilers BOOLEAN DEFAULT FALSE,
    spoiler_tags TEXT[],
    content_rating VARCHAR(20) DEFAULT 'general', -- 'general', 'mature', 'adult'
    
    -- Engagement metrics
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Quality metrics
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Activity tracking
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reply_at TIMESTAMP WITH TIME ZONE,
    last_reply_by UUID REFERENCES public.storyweave_profiles(id),
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    approved_by UUID REFERENCES public.storyweave_profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Tags and categorization
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread replies/posts
CREATE TABLE public.thread_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    
    -- Reply content
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown', -- 'markdown', 'html', 'plain'
    
    -- Content properties
    contains_spoilers BOOLEAN DEFAULT FALSE,
    spoiler_warning TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    upvote_count INTEGER DEFAULT 0,
    downvote_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    
    -- Threading and organization
    reply_depth INTEGER DEFAULT 0,
    reply_path TEXT, -- Materialized path for efficient querying
    
    -- Editing and history
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    edit_reason TEXT,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    moderation_notes TEXT,
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Thread and reply reactions
CREATE TABLE public.content_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Target content (either thread or reply)
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    
    -- Reaction details
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'laugh', 'wow', 'sad', 'angry', 'upvote', 'downvote'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one target is set
    CONSTRAINT content_reactions_target_check CHECK (
        (thread_id IS NOT NULL AND reply_id IS NULL) OR
        (thread_id IS NULL AND reply_id IS NOT NULL)
    ),
    
    -- Unique reaction per user per content
    UNIQUE(user_id, thread_id, reaction_type),
    UNIQUE(user_id, reply_id, reaction_type)
);

-- Thread views tracking
CREATE TABLE public.thread_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- View details
    view_count INTEGER DEFAULT 1,
    total_time_spent INTEGER DEFAULT 0, -- in seconds
    last_position INTEGER DEFAULT 0, -- last scroll position or reply viewed
    
    -- Tracking
    first_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(thread_id, user_id)
);

-- User bookmarks
CREATE TABLE public.user_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Bookmarkable content
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    reply_id UUID REFERENCES public.thread_replies(id) ON DELETE CASCADE,
    
    -- Bookmark organization
    folder_name VARCHAR(100) DEFAULT 'General',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one target is set
    CONSTRAINT bookmarks_target_check CHECK (
        (thread_id IS NOT NULL AND reply_id IS NULL) OR
        (thread_id IS NULL AND reply_id IS NOT NULL)
    )
);

-- User follows (for threads, users, categories)
CREATE TABLE public.user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Follow targets
    following_user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    following_thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    following_category_id UUID REFERENCES public.discussion_categories(id) ON DELETE CASCADE,
    
    -- Follow settings
    notification_level VARCHAR(20) DEFAULT 'all', -- 'all', 'mentions', 'none'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one target is set
    CONSTRAINT follows_target_check CHECK (
        (following_user_id IS NOT NULL AND following_thread_id IS NULL AND following_category_id IS NULL) OR
        (following_user_id IS NULL AND following_thread_id IS NOT NULL AND following_category_id IS NULL) OR
        (following_user_id IS NULL AND following_thread_id IS NULL AND following_category_id IS NOT NULL)
    ),
    
    -- Prevent self-following users
    CONSTRAINT no_self_follow CHECK (follower_id != following_user_id)
);

-- Polls system (for poll-type threads)
CREATE TABLE public.thread_polls (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    
    -- Poll settings
    question TEXT NOT NULL,
    allows_multiple_choices BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Timing
    closes_at TIMESTAMP WITH TIME ZONE,
    is_closed BOOLEAN DEFAULT FALSE,
    
    -- Stats
    total_votes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options
CREATE TABLE public.poll_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.thread_polls(id) ON DELETE CASCADE,
    
    option_text VARCHAR(200) NOT NULL,
    option_order INTEGER DEFAULT 0,
    vote_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll votes
CREATE TABLE public.poll_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    poll_id UUID REFERENCES public.thread_polls(id) ON DELETE CASCADE,
    option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(poll_id, option_id, voter_id)
);

-- Writing prompts (special thread type)
CREATE TABLE public.writing_prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Prompt details
    prompt_text TEXT NOT NULL,
    prompt_type VARCHAR(30) DEFAULT 'general', -- 'general', 'character', 'dialogue', 'setting', 'plot'
    difficulty_level VARCHAR(20) DEFAULT 'beginner',
    
    -- Constraints
    word_count_min INTEGER,
    word_count_max INTEGER,
    time_limit_minutes INTEGER,
    required_elements TEXT[],
    
    -- Prompt settings
    allows_collaboration BOOLEAN DEFAULT FALSE,
    is_contest BOOLEAN DEFAULT FALSE,
    
    -- Contest details (if applicable)
    contest_deadline TIMESTAMP WITH TIME ZONE,
    prize_description TEXT,
    judging_criteria TEXT[],
    
    -- Stats
    submission_count INTEGER DEFAULT 0,
    participation_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing prompt submissions
CREATE TABLE public.prompt_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES public.writing_prompts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Submission content
    title VARCHAR(255),
    content TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    
    -- Submission metadata
    writing_time_minutes INTEGER,
    author_notes TEXT,
    
    -- Contest features
    is_contest_entry BOOLEAN DEFAULT FALSE,
    contest_score DECIMAL(5,2),
    judge_feedback TEXT,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
