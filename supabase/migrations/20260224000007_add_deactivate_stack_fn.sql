-- Migration: Add deactivate_active_stack function
-- Description: Safely deactivate active habit stacks for a user
-- Dependencies: habit_stacks, habits

CREATE OR REPLACE FUNCTION deactivate_active_stack(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER := 0;
BEGIN
  UPDATE habit_stacks
  SET is_active = FALSE
  WHERE user_id = p_user_id
    AND is_active = TRUE;
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  UPDATE habits
  SET is_active = FALSE
  WHERE user_id = p_user_id
    AND is_active = TRUE;

  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION deactivate_active_stack(UUID) FROM PUBLIC;
