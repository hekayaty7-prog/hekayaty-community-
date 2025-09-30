-- =====================================================
-- WRITING WORKSHOPS SYSTEM
-- =====================================================

-- Workshop categories/types
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

-- Main workshops table
CREATE TABLE public.workshops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.workshop_categories(id) ON DELETE SET NULL,
    
    -- Workshop details
    genre VARCHAR(100),
    target_words INTEGER,
    duration_weeks INTEGER DEFAULT 12,
    timeline TEXT, -- "12 weeks", "6 months", etc.
    difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
    
    -- Participation settings
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 1,
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    
    -- Workshop type and structure
    workshop_type VARCHAR(30) DEFAULT 'collaborative', -- 'collaborative', 'critique', 'challenge', 'course'
    meeting_schedule JSONB, -- {"frequency": "weekly", "day": "sunday", "time": "19:00"}
    resources JSONB DEFAULT '[]', -- Links, documents, references
    
    -- Status and progress
    status VARCHAR(20) DEFAULT 'recruiting', -- 'recruiting', 'active', 'completed', 'cancelled', 'paused'
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Requirements and guidelines
    requirements TEXT, -- Prerequisites, experience level
    guidelines TEXT, -- Workshop rules and expectations
    
    -- Engagement stats
    view_count INTEGER DEFAULT 0,
    application_count INTEGER DEFAULT 0,
    
    -- Timestamps
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop participants/members
CREATE TABLE public.workshop_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Membership details
    role VARCHAR(20) DEFAULT 'participant', -- 'creator', 'moderator', 'participant', 'observer'
    status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'inactive', 'removed'
    
    -- Participation tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contribution_count INTEGER DEFAULT 0,
    words_contributed INTEGER DEFAULT 0,
    feedback_given_count INTEGER DEFAULT 0,
    feedback_received_count INTEGER DEFAULT 0,
    
    -- Progress and goals
    personal_goal TEXT,
    progress_notes TEXT,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    UNIQUE(workshop_id, user_id)
);

-- Workshop projects/submissions
CREATE TABLE public.workshop_projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Project details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    project_type VARCHAR(30) DEFAULT 'story', -- 'story', 'chapter', 'poem', 'outline', 'character', 'worldbuilding'
    
    -- Content metrics
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    page_count INTEGER DEFAULT 0,
    
    -- Status and versioning
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'under_review', 'completed', 'archived'
    version_number INTEGER DEFAULT 1,
    is_final_submission BOOLEAN DEFAULT FALSE,
    
    -- Feedback and ratings
    feedback_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    total_views INTEGER DEFAULT 0,
    
    -- Collaboration
    allows_collaboration BOOLEAN DEFAULT TRUE,
    collaborator_ids UUID[] DEFAULT '{}',
    
    -- File attachments
    attachments JSONB DEFAULT '[]', -- File URLs, images, etc.
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    deadline_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop feedback system
CREATE TABLE public.workshop_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.workshop_projects(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Feedback content
    feedback_text TEXT NOT NULL,
    feedback_type VARCHAR(20) DEFAULT 'general', -- 'general', 'line_edit', 'structural', 'grammar', 'style'
    
    -- Ratings (1-5 scale)
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    plot_rating INTEGER CHECK (plot_rating >= 1 AND plot_rating <= 5),
    character_rating INTEGER CHECK (character_rating >= 1 AND character_rating <= 5),
    style_rating INTEGER CHECK (style_rating >= 1 AND style_rating <= 5),
    
    -- Feedback settings
    is_public BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Specific feedback areas
    strengths TEXT,
    areas_for_improvement TEXT,
    suggestions TEXT,
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop assignments/prompts
CREATE TABLE public.workshop_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Assignment details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    assignment_type VARCHAR(30) DEFAULT 'writing', -- 'writing', 'reading', 'critique', 'discussion'
    
    -- Requirements
    word_count_min INTEGER,
    word_count_max INTEGER,
    required_elements JSONB, -- ["dialogue", "setting_description", "character_development"]
    
    -- Timing
    due_date TIMESTAMP WITH TIME ZONE,
    is_optional BOOLEAN DEFAULT FALSE,
    
    -- Resources
    reference_materials JSONB DEFAULT '[]',
    example_submissions JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop assignment submissions
CREATE TABLE public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.workshop_assignments(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.workshop_projects(id) ON DELETE SET NULL,
    
    -- Submission details
    content TEXT,
    word_count INTEGER DEFAULT 0,
    submission_notes TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'submitted', -- 'draft', 'submitted', 'late', 'graded'
    is_late BOOLEAN DEFAULT FALSE,
    
    -- Grading (if applicable)
    grade VARCHAR(10), -- 'A', 'B', 'C', etc. or numerical
    instructor_feedback TEXT,
    
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop chat/discussions
CREATE TABLE public.workshop_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Message content
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'file', 'announcement', 'system'
    
    -- Threading
    reply_to_id UUID REFERENCES public.workshop_messages(id) ON DELETE SET NULL,
    thread_id UUID, -- Group related messages
    
    -- Attachments and media
    attachments JSONB DEFAULT '[]',
    
    -- Message properties
    is_pinned BOOLEAN DEFAULT FALSE,
    is_announcement BOOLEAN DEFAULT FALSE,
    
    -- Engagement
    reaction_counts JSONB DEFAULT '{}', -- {"👍": 5, "❤️": 2}
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop events/milestones
CREATE TABLE public.workshop_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Event details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(30) DEFAULT 'meeting', -- 'meeting', 'deadline', 'milestone', 'celebration'
    
    -- Timing
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Virtual meeting info
    meeting_url TEXT,
    meeting_password TEXT,
    meeting_platform VARCHAR(50), -- 'zoom', 'discord', 'google_meet', etc.
    
    -- Attendance
    max_attendees INTEGER,
    rsvp_required BOOLEAN DEFAULT FALSE,
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_intervals INTEGER[] DEFAULT '{1440, 60}', -- Minutes before event
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workshop event RSVPs
CREATE TABLE public.workshop_event_rsvps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES public.workshop_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    response VARCHAR(20) DEFAULT 'yes', -- 'yes', 'no', 'maybe'
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);
