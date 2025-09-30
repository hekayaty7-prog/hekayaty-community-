-- =====================================================
-- COMPLETE WORKSHOP FIX - Run this in Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS workshop_messages CASCADE;
DROP TABLE IF EXISTS workshop_members CASCADE;

-- Create workshop_members table
CREATE TABLE workshop_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT DEFAULT 'member',
  UNIQUE(workshop_id, user_id)
);

-- Create workshop_messages table
CREATE TABLE workshop_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshop_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workshop_members
CREATE POLICY "Anyone can view workshop members" ON workshop_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join workshops" ON workshop_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave workshops they joined" ON workshop_members
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workshop_messages
CREATE POLICY "Workshop members can view messages" ON workshop_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workshop_members 
      WHERE workshop_members.workshop_id = workshop_messages.workshop_id 
      AND workshop_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workshop members can send messages" ON workshop_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM workshop_members 
      WHERE workshop_members.workshop_id = workshop_messages.workshop_id 
      AND workshop_members.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_workshop_members_workshop_id ON workshop_members(workshop_id);
CREATE INDEX idx_workshop_members_user_id ON workshop_members(user_id);
CREATE INDEX idx_workshop_messages_workshop_id ON workshop_messages(workshop_id);
CREATE INDEX idx_workshop_messages_created_at ON workshop_messages(created_at);

-- RPC functions for participant counting
CREATE OR REPLACE FUNCTION increment_workshop_participants(workshop_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE workshops
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = workshop_id;
$$;

CREATE OR REPLACE FUNCTION decrement_workshop_participants(workshop_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE workshops
  SET current_participants = GREATEST(COALESCE(current_participants, 1) - 1, 0)
  WHERE id = workshop_id;
$$;

-- Function to automatically add creator as member
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO workshop_members (workshop_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (workshop_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically add creator as member
DROP TRIGGER IF EXISTS trigger_add_creator_as_member ON workshops;
CREATE TRIGGER trigger_add_creator_as_member
  AFTER INSERT ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- Add creators of existing workshops as members
INSERT INTO workshop_members (workshop_id, user_id, role)
SELECT id, creator_id, 'creator'
FROM workshops
ON CONFLICT (workshop_id, user_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Workshop system completely fixed!';
    RAISE NOTICE '🎯 Creators are now automatically members.';
    RAISE NOTICE '🚀 Join workshop functionality should work now.';
END $$;
