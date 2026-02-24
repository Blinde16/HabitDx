-- Migration: Create database functions and triggers
-- Description: Utility functions and automated triggers
-- Dependencies: All previous table migrations

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column to current timestamp';

-- ============================================================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_user_profile() IS 'Automatically creates a user profile when a new user signs up';

-- ============================================================================
-- FUNCTION: Generate unique share token
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 12-character token
    token := encode(gen_random_bytes(9), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 12);
    
    -- Check if token already exists
    SELECT EXISTS(
      SELECT 1 FROM habit_failure_profiles WHERE share_token = token
    ) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_share_token() IS 'Generates a unique 12-character token for sharing failure profiles';

-- ============================================================================
-- FUNCTION: Calculate week range from date
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_week_range(input_date DATE, start_day INTEGER DEFAULT 1)
RETURNS TABLE(week_start DATE, week_end DATE) AS $$
BEGIN
  -- start_day: 0=Sunday, 1=Monday, etc.
  RETURN QUERY
  SELECT
    (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER - start_day + 7) % 7) * INTERVAL '1 day')::DATE AS week_start,
    (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER - start_day + 7) % 7) * INTERVAL '1 day' + INTERVAL '6 days')::DATE AS week_end;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_week_range(DATE, INTEGER) IS 'Calculates week start and end dates for a given date and week start day';

-- ============================================================================
-- FUNCTION: Get habit completion rate
-- ============================================================================
CREATE OR REPLACE FUNCTION get_habit_completion_rate(
  p_habit_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS NUMERIC AS $$
DECLARE
  total_days INTEGER;
  completed_days INTEGER;
BEGIN
  -- Count total days in range
  total_days := (p_end_date - p_start_date + 1);
  
  -- Count completed days
  SELECT COUNT(*)
  INTO completed_days
  FROM habit_logs
  WHERE habit_id = p_habit_id
    AND log_date BETWEEN p_start_date AND p_end_date
    AND completed = TRUE;
  
  -- Return percentage
  IF total_days = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_days::NUMERIC / total_days::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_habit_completion_rate(UUID, DATE, DATE) IS 'Calculates completion rate percentage for a habit in a date range';

-- ============================================================================
-- FUNCTION: Validate log date is not in future
-- ============================================================================
CREATE OR REPLACE FUNCTION validate_log_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.log_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create habit log for future date: %', NEW.log_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_log_date() IS 'Prevents creating habit logs for future dates';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-update updated_at on user_profiles
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-create profile after user signup
CREATE TRIGGER trigger_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Trigger: Validate habit log dates
CREATE TRIGGER trigger_validate_log_date
  BEFORE INSERT OR UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION validate_log_date();

-- Add comments on triggers
COMMENT ON TRIGGER trigger_user_profiles_updated_at ON user_profiles IS 'Automatically updates updated_at timestamp';
COMMENT ON TRIGGER trigger_create_user_profile ON auth.users IS 'Creates user profile automatically on signup';
COMMENT ON TRIGGER trigger_validate_log_date ON habit_logs IS 'Prevents creating logs for future dates';
