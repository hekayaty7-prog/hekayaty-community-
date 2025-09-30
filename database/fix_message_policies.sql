-- =====================================================
-- FIX MESSAGE SENDING POLICIES
-- Run this in Supabase SQL Editor to fix message sending
-- =====================================================

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Workshop members can send messages" ON workshop_messages;
DROP POLICY IF EXISTS "Workshop members can view messages" ON workshop_messages;

-- Create more permissive policies for testing
CREATE POLICY "Authenticated users can send messages" ON workshop_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view messages" ON workshop_messages
  FOR SELECT USING (true);

-- Also check workshop_members policies
DROP POLICY IF EXISTS "Authenticated users can join workshops" ON workshop_members;
DROP POLICY IF EXISTS "Anyone can view workshop members" ON workshop_members;

CREATE POLICY "Authenticated users can join workshops" ON workshop_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view workshop members" ON workshop_members
  FOR SELECT USING (true);

-- Make sure RPC functions have proper permissions
GRANT EXECUTE ON FUNCTION increment_workshop_participants(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_workshop_participants(uuid) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Message policies fixed!';
    RAISE NOTICE '🎯 Users should now be able to send messages.';
END $$;
