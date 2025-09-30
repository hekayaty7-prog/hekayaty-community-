-- =====================================================
-- WORKSHOP FEATURES UPDATE - Only add missing pieces
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add the RPC functions for participant counting
CREATE OR REPLACE FUNCTION increment_workshop_participants(workshop_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE workshops
  SET current_participants = COALESCE(current_participants, 0) + 1
  WHERE id = workshop_id;
$$;

CREATE OR REPLACE FUNCTION decrement_workshop_participants(workshop_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE workshops
  SET current_participants = GREATEST(COALESCE(current_participants, 1) - 1, 0)
  WHERE id = workshop_id;
$$;

-- Create or replace the trigger function (in case it doesn't exist)
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workshop_members (workshop_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator')
  ON CONFLICT (workshop_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it works
DROP TRIGGER IF EXISTS trigger_add_creator_as_member ON workshops;
CREATE TRIGGER trigger_add_creator_as_member
  AFTER INSERT ON workshops
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_member();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Workshop features updated successfully!';
    RAISE NOTICE '🎯 RPC functions and triggers are now ready.';
END $$;
