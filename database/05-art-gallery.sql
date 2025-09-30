-- =====================================================
-- ART GALLERY SYSTEM
-- =====================================================

-- Art categories
CREATE TABLE public.art_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#6366f1',
    
    -- Category settings
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Organization
    parent_category_id UUID REFERENCES public.art_categories(id),
    sort_order INTEGER DEFAULT 0,
    
    -- Stats
    artwork_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main artworks table
CREATE TABLE public.artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic artwork information
    title VARCHAR(255) NOT NULL,
    description TEXT,
    artist_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.art_categories(id) ON DELETE SET NULL,
    
    -- Artwork files and media
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    high_res_url TEXT,
    
    -- File metadata
    file_size INTEGER, -- in bytes
    file_format VARCHAR(10), -- 'jpg', 'png', 'gif', 'webp', etc.
    dimensions JSONB, -- {"width": 1920, "height": 1080}
    color_palette JSONB, -- ["#ff0000", "#00ff00", "#0000ff"]
    
    -- Artwork details
    medium VARCHAR(100), -- 'digital', 'oil_painting', 'watercolor', 'pencil', etc.
    technique VARCHAR(100),
    software_used VARCHAR(100), -- For digital art
    creation_time_hours INTEGER,
    
    -- Content and context
    story_context TEXT, -- How it relates to a story/book
    character_names TEXT[], -- If it depicts characters
    setting_description TEXT,
    inspiration_sources TEXT[],
    
    -- Categorization and discovery
    tags TEXT[] DEFAULT '{}',
    style_tags TEXT[] DEFAULT '{}', -- 'realistic', 'cartoon', 'anime', 'abstract', etc.
    mood_tags TEXT[] DEFAULT '{}', -- 'dark', 'cheerful', 'mysterious', etc.
    
    -- Content ratings and warnings
    content_rating VARCHAR(20) DEFAULT 'general', -- 'general', 'teen', 'mature', 'adult'
    content_warnings TEXT[], -- 'violence', 'nudity', 'gore', etc.
    is_nsfw BOOLEAN DEFAULT FALSE,
    
    -- Licensing and usage
    license_type VARCHAR(50) DEFAULT 'all_rights_reserved',
    allows_commercial_use BOOLEAN DEFAULT FALSE,
    allows_modifications BOOLEAN DEFAULT FALSE,
    attribution_required BOOLEAN DEFAULT TRUE,
    
    -- Engagement metrics
    view_count INTEGER DEFAULT 0,
    unique_view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Quality and curation
    featured_score DECIMAL(5,2) DEFAULT 0.00,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_at TIMESTAMP WITH TIME ZONE,
    curator_notes TEXT,
    
    -- Status and moderation
    status VARCHAR(20) DEFAULT 'published', -- 'draft', 'pending', 'published', 'archived', 'removed'
    is_approved BOOLEAN DEFAULT TRUE,
    moderation_notes TEXT,
    
    -- Timestamps
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artwork collections/galleries
CREATE TABLE public.art_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Collection details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
    
    -- Collection settings
    is_public BOOLEAN DEFAULT TRUE,
    allows_submissions BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    
    -- Organization
    sort_order_type VARCHAR(20) DEFAULT 'date_added', -- 'date_added', 'date_created', 'title', 'custom'
    
    -- Stats
    artwork_count INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artworks in collections
CREATE TABLE public.collection_artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    collection_id UUID REFERENCES public.art_collections(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    added_by UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Organization
    sort_order INTEGER DEFAULT 0,
    featured_in_collection BOOLEAN DEFAULT FALSE,
    
    -- Notes
    curator_notes TEXT,
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(collection_id, artwork_id)
);

-- Artwork likes/favorites
CREATE TABLE public.artwork_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'wow', 'favorite'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(artwork_id, user_id, reaction_type)
);

-- Artwork views tracking
CREATE TABLE public.artwork_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- View details
    view_duration_seconds INTEGER DEFAULT 0,
    referrer_url TEXT,
    user_agent TEXT,
    
    -- Geographic info (if available)
    country_code VARCHAR(2),
    city VARCHAR(100),
    
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(artwork_id, user_id, DATE(viewed_at))
);

-- Artwork comments
CREATE TABLE public.artwork_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.artwork_comments(id) ON DELETE CASCADE,
    
    -- Comment content
    content TEXT NOT NULL,
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT TRUE,
    is_hidden BOOLEAN DEFAULT FALSE,
    
    -- Editing
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artwork comment reactions
CREATE TABLE public.comment_reactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES public.artwork_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(comment_id, user_id, reaction_type)
);

-- Art challenges/contests
CREATE TABLE public.art_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Challenge details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(100),
    prompt TEXT,
    
    -- Challenge rules
    rules TEXT,
    submission_guidelines TEXT,
    judging_criteria TEXT[],
    
    -- Timing
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    voting_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Challenge settings
    max_submissions_per_user INTEGER DEFAULT 1,
    allows_collaboration BOOLEAN DEFAULT FALSE,
    requires_original_work BOOLEAN DEFAULT TRUE,
    
    -- Prizes and recognition
    has_prizes BOOLEAN DEFAULT FALSE,
    prize_description TEXT,
    winner_count INTEGER DEFAULT 1,
    
    -- Participation
    participant_count INTEGER DEFAULT 0,
    submission_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'judging', 'completed', 'cancelled'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge submissions
CREATE TABLE public.challenge_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.art_challenges(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Submission details
    artist_statement TEXT,
    process_description TEXT,
    inspiration_notes TEXT,
    
    -- Contest features
    vote_count INTEGER DEFAULT 0,
    judge_score DECIMAL(5,2),
    judge_feedback TEXT,
    
    -- Results
    placement INTEGER, -- 1st, 2nd, 3rd place, etc.
    won_prize BOOLEAN DEFAULT FALSE,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(challenge_id, artwork_id)
);

-- Challenge voting (if public voting is enabled)
CREATE TABLE public.challenge_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.art_challenges(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(challenge_id, submission_id, voter_id)
);

-- Artist portfolios (curated collections by artists)
CREATE TABLE public.artist_portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Portfolio details
    name VARCHAR(255) NOT NULL DEFAULT 'Main Portfolio',
    description TEXT,
    cover_artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
    
    -- Portfolio settings
    is_public BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio artworks
CREATE TABLE public.portfolio_artworks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    portfolio_id UUID REFERENCES public.artist_portfolios(id) ON DELETE CASCADE,
    artwork_id UUID REFERENCES public.artworks(id) ON DELETE CASCADE,
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(portfolio_id, artwork_id)
);

-- Art commissions (if artists offer commission work)
CREATE TABLE public.art_commissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    artist_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Commission details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirements TEXT,
    reference_images JSONB DEFAULT '[]',
    
    -- Pricing and timeline
    price_usd DECIMAL(10,2),
    estimated_hours INTEGER,
    deadline DATE,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'requested', -- 'requested', 'accepted', 'in_progress', 'completed', 'delivered', 'cancelled'
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Communication
    private_notes TEXT,
    client_feedback TEXT,
    
    -- Results
    final_artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
    client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
