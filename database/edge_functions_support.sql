-- =====================================================
-- DATABASE FUNCTIONS FOR EDGE FUNCTIONS SUPPORT
-- =====================================================
-- Run this in your Supabase SQL Editor

-- Function to increment workshop participants
CREATE OR REPLACE FUNCTION increment_workshop_participants(workshop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE workshops 
  SET current_participants = current_participants + 1,
      updated_at = NOW()
  WHERE id = workshop_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement workshop participants
CREATE OR REPLACE FUNCTION decrement_workshop_participants(workshop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE workshops 
  SET current_participants = GREATEST(current_participants - 1, 0),
      updated_at = NOW()
  WHERE id = workshop_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment book club members
CREATE OR REPLACE FUNCTION increment_book_club_members(club_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE book_clubs 
  SET member_count = member_count + 1,
      updated_at = NOW()
  WHERE id = club_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement book club members
CREATE OR REPLACE FUNCTION decrement_book_club_members(club_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE book_clubs 
  SET member_count = GREATEST(member_count - 1, 0),
      updated_at = NOW()
  WHERE id = club_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment thread replies
CREATE OR REPLACE FUNCTION increment_thread_replies(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discussion_threads 
  SET reply_count = reply_count + 1,
      last_activity_at = NOW()
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement thread replies
CREATE OR REPLACE FUNCTION decrement_thread_replies(thread_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE discussion_threads 
  SET reply_count = GREATEST(reply_count - 1, 0),
      last_activity_at = NOW()
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add user points
CREATE OR REPLACE FUNCTION add_user_points(user_id UUID, points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE storyweave_profiles 
  SET total_points = total_points + points,
      updated_at = NOW()
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Edge Functions database support added successfully!';
    RAISE NOTICE '🎯 All RPC functions are now available for Edge Functions.';
END $$;
