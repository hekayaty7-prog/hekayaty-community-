-- =====================================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- =====================================================

-- 1. Create the community profiles table
CREATE TABLE IF NOT EXISTS storyweave_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hekayaty_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT 'Member from HEKAYATY platform',
  is_verified BOOLEAN DEFAULT false,
  total_points INTEGER DEFAULT 0,
  community_level INTEGER DEFAULT 1,
  
  -- Link to main website
  main_website_user_id TEXT,
  sync_status TEXT DEFAULT 'active',
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create sync log table
CREATE TABLE IF NOT EXISTS user_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  main_website_user_id TEXT NOT NULL,
  supabase_user_id UUID,
  community_profile_id UUID REFERENCES storyweave_profiles(id),
  sync_type TEXT NOT NULL, -- 'create', 'update', 'login'
  sync_data JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storyweave_profiles_hekayaty_user_id ON storyweave_profiles(hekayaty_user_id);
CREATE INDEX IF NOT EXISTS idx_storyweave_profiles_main_website_user_id ON storyweave_profiles(main_website_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sync_log_main_user_id ON user_sync_log(main_website_user_id);

-- 4. Enable Row Level Security
ALTER TABLE storyweave_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sync_log ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
CREATE POLICY "Users can view all profiles" ON storyweave_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON storyweave_profiles
  FOR UPDATE USING (auth.uid() = hekayaty_user_id);

CREATE POLICY "Users can insert own profile" ON storyweave_profiles
  FOR INSERT WITH CHECK (auth.uid() = hekayaty_user_id);

CREATE POLICY "Users can view own sync logs" ON user_sync_log
  FOR SELECT USING (true);

CREATE POLICY "System can insert sync logs" ON user_sync_log
  FOR INSERT WITH CHECK (true);

-- 6. Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger
CREATE TRIGGER update_storyweave_profiles_updated_at 
    BEFORE UPDATE ON storyweave_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
