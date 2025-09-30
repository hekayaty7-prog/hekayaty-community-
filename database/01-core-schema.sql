-- =====================================================
-- HEKAYATY StoryWeaveConnect - Core Database Schema
-- =====================================================
-- This schema integrates with HEKAYATY's existing user system
-- Users are already authenticated through HEKAYATY platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USER PROFILES (Extends HEKAYATY Users)
-- =====================================================

-- StoryWeave-specific user profiles that extend HEKAYATY users
CREATE TABLE public.storyweave_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    hekayaty_user_id VARCHAR(255) UNIQUE NOT NULL, -- Reference to HEKAYATY user ID
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
    writing_experience VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'professional'
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
    profile_visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'friends', 'private'
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

-- User achievements/badges
CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100), -- Icon name or URL
    category VARCHAR(50), -- 'writing', 'reading', 'community', 'special'
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    points_reward INTEGER DEFAULT 0,
    requirements JSONB, -- Criteria for earning
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User earned achievements
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB, -- Track progress towards achievement
    UNIQUE(user_id, achievement_id)
);

-- User activity log
CREATE TABLE public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.storyweave_profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
