-- =====================================================
-- MESSAGING & NOTIFICATIONS SYSTEM
-- =====================================================

-- Direct messages between users
CREATE TABLE public.direct_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Message content
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Message status
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE,
    
    -- Threading (for message conversations)
    conversation_id UUID,
    reply_to_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
    
    -- Timestamps
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message conversations (grouping related messages)
CREATE TABLE public.message_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Participants
    participant_1_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    participant_2_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Conversation metadata
    last_message_id UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Participant settings
    participant_1_archived BOOLEAN DEFAULT FALSE,
    participant_2_archived BOOLEAN DEFAULT FALSE,
    participant_1_muted BOOLEAN DEFAULT FALSE,
    participant_2_muted BOOLEAN DEFAULT FALSE,
    
    -- Message counts
    total_messages INTEGER DEFAULT 0,
    participant_1_unread_count INTEGER DEFAULT 0,
    participant_2_unread_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(participant_1_id, participant_2_id)
);

-- System notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    
    -- Action and navigation
    action_url TEXT,
    action_text VARCHAR(100),
    
    -- Related content IDs (for context)
    related_thread_id UUID,
    related_workshop_id UUID,
    related_club_id UUID,
    related_artwork_id UUID,
    related_book_id UUID,
    
    -- Notification metadata
    metadata JSONB DEFAULT '{}',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    
    -- Priority and grouping
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    group_key VARCHAR(100), -- For grouping similar notifications
    
    -- Timestamps
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences per user
CREATE TABLE public.notification_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE UNIQUE,
    
    -- Email notifications
    email_enabled BOOLEAN DEFAULT TRUE,
    email_frequency VARCHAR(20) DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly', 'never'
    
    -- Push notifications (for mobile/web)
    push_enabled BOOLEAN DEFAULT TRUE,
    
    -- Specific notification types
    notify_new_followers BOOLEAN DEFAULT TRUE,
    notify_mentions BOOLEAN DEFAULT TRUE,
    notify_replies BOOLEAN DEFAULT TRUE,
    notify_likes BOOLEAN DEFAULT TRUE,
    notify_workshop_updates BOOLEAN DEFAULT TRUE,
    notify_club_updates BOOLEAN DEFAULT TRUE,
    notify_new_messages BOOLEAN DEFAULT TRUE,
    notify_system_announcements BOOLEAN DEFAULT TRUE,
    
    -- Workshop-specific
    notify_workshop_assignments BOOLEAN DEFAULT TRUE,
    notify_workshop_deadlines BOOLEAN DEFAULT TRUE,
    notify_workshop_feedback BOOLEAN DEFAULT TRUE,
    
    -- Book club-specific
    notify_club_discussions BOOLEAN DEFAULT TRUE,
    notify_reading_reminders BOOLEAN DEFAULT TRUE,
    notify_club_events BOOLEAN DEFAULT TRUE,
    
    -- Art gallery-specific
    notify_artwork_comments BOOLEAN DEFAULT TRUE,
    notify_challenge_updates BOOLEAN DEFAULT TRUE,
    notify_featured_artwork BOOLEAN DEFAULT FALSE,
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time activity feed
CREATE TABLE public.activity_feed (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    activity_description TEXT,
    
    -- Related content
    related_user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    related_content_type VARCHAR(30), -- 'thread', 'workshop', 'club', 'artwork', 'book'
    related_content_id UUID,
    
    -- Activity metadata
    metadata JSONB DEFAULT '{}',
    
    -- Visibility and privacy
    is_public BOOLEAN DEFAULT TRUE,
    visibility_level VARCHAR(20) DEFAULT 'public', -- 'public', 'followers', 'private'
    
    -- Engagement
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User mentions in content
CREATE TABLE public.user_mentions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentioned_user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    mentioning_user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Content where mention occurred
    content_type VARCHAR(30) NOT NULL, -- 'thread', 'reply', 'comment', 'message'
    content_id UUID NOT NULL,
    
    -- Mention context
    mention_text TEXT, -- The actual mention text
    context_snippet TEXT, -- Surrounding text for context
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcement system
CREATE TABLE public.announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Announcement content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Targeting
    target_audience VARCHAR(30) DEFAULT 'all', -- 'all', 'premium', 'moderators', 'specific'
    target_user_ids UUID[], -- For specific targeting
    
    -- Display settings
    announcement_type VARCHAR(30) DEFAULT 'general', -- 'general', 'feature', 'maintenance', 'event'
    priority VARCHAR(20) DEFAULT 'normal',
    banner_color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50),
    
    -- Visibility and timing
    is_published BOOLEAN DEFAULT FALSE,
    is_dismissible BOOLEAN DEFAULT TRUE,
    auto_dismiss_after_days INTEGER DEFAULT 7,
    
    -- Scheduling
    publish_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Stats
    view_count INTEGER DEFAULT 0,
    dismiss_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User announcement interactions
CREATE TABLE public.announcement_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Interaction type
    interaction_type VARCHAR(20) NOT NULL, -- 'viewed', 'dismissed', 'clicked'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(announcement_id, user_id, interaction_type)
);

-- Email queue for outbound notifications
CREATE TABLE public.email_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipient_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Email details
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    
    -- Sending details
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Scheduling
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Error handling
    error_message TEXT,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification tokens (for mobile/web push)
CREATE TABLE public.push_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    
    -- Token details
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'web', 'ios', 'android'
    device_info JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, token)
);
