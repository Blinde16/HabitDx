-- ============================================================================
-- HabitDx Database Schema - Complete Migration
-- Run this in Supabase Dashboard SQL Editor
-- Date: February 12, 2026
-- ============================================================================

-- Migration 1: Create user_profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Onboarding data
  past_failures TEXT[],
  constraints JSONB,
  goals TEXT[],
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,

  -- Settings
  timezone TEXT DEFAULT 'America/New_York' NOT NULL,
  notification_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  weekly_iteration_day INTEGER DEFAULT 1 CHECK (weekly_iteration_day >= 0 AND weekly_iteration_day <= 6)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Migration 2: Create habit_failure_profiles table
-- ============================================================================
CREATE TABLE IF NOT EXISTS habit_failure_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- AI Analysis
  failure_patterns TEXT[],
  root_causes TEXT[],
  personality_insights JSONB,
  recommendations TEXT[],

  -- Shareability
  share_token TEXT UNIQUE,
  view_count INTEGER DEFAULT 0 NOT NULL,

  -- Versioning
  version INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_failure_profiles_user_active 
  ON habit_failure_profiles(user_id) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_habit_failure_profiles_share_token 
  ON habit_failure_profiles(share_token) 
  WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_habit_failure_profiles_user_id 
  ON habit_failure_profiles(user_id);

-- Migration 3: Create habit_stacks table
-- ============================================================================
CREATE TABLE IF NOT EXISTS habit_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  failure_profile_id UUID REFERENCES habit_failure_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Stack metadata
  name TEXT DEFAULT 'My Habit Stack' NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,

  -- AI generation context
  generation_context JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_stacks_user_active 
  ON habit_stacks(user_id) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_habit_stacks_user_id 
  ON habit_stacks(user_id);

CREATE INDEX IF NOT EXISTS idx_habit_stacks_failure_profile_id 
  ON habit_stacks(failure_profile_id) 
  WHERE failure_profile_id IS NOT NULL;

-- Migration 4: Create habits table
-- ============================================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES habit_stacks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Habit details
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,

  -- Scheduling
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'custom')),
  frequency_days INTEGER[],
  reminder_time TIME,

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  archived_at TIMESTAMPTZ,

  -- Order in stack
  display_order INTEGER DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_habits_stack_active 
  ON habits(stack_id, is_active) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_habits_stack_id 
  ON habits(stack_id);

CREATE INDEX IF NOT EXISTS idx_habits_display_order 
  ON habits(stack_id, display_order);

-- Migration 5: Create habit_logs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Check-in data
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL,
  obstacle TEXT,

  -- Metadata
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  checked_in_via TEXT DEFAULT 'app' NOT NULL CHECK (checked_in_via IN ('app', 'notification', 'widget')),

  UNIQUE(habit_id, log_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_logs_habit_date 
  ON habit_logs(habit_id, log_date);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
  ON habit_logs(user_id, log_date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id 
  ON habit_logs(habit_id);

CREATE INDEX IF NOT EXISTS idx_habit_logs_date 
  ON habit_logs(log_date DESC);

-- Migration 6: Create weekly_iterations table
-- ============================================================================
CREATE TABLE IF NOT EXISTS weekly_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Week metadata
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL CHECK (week_end_date > week_start_date),

  -- AI Analysis
  patterns_detected TEXT[],
  success_rate JSONB,
  adjustment_suggestion TEXT NOT NULL,
  adjustment_rationale TEXT,

  -- User interaction
  user_response TEXT CHECK (user_response IN ('accepted', 'declined', 'pending')),
  responded_at TIMESTAMPTZ,

  -- Implementation
  implemented BOOLEAN DEFAULT FALSE NOT NULL,
  implementation_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_weekly_iterations_user_week 
  ON weekly_iterations(user_id, week_start_date DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_iterations_user_id 
  ON weekly_iterations(user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_iterations_stack_id 
  ON weekly_iterations(stack_id) 
  WHERE stack_id IS NOT NULL;

-- Migration 7: Create functions and triggers
-- ============================================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Generate unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    token := encode(gen_random_bytes(9), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := substring(token, 1, 12);
    
    SELECT EXISTS(
      SELECT 1 FROM habit_failure_profiles WHERE share_token = token
    ) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate week range from date
CREATE OR REPLACE FUNCTION calculate_week_range(input_date DATE, start_day INTEGER DEFAULT 1)
RETURNS TABLE(week_start DATE, week_end DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER - start_day + 7) % 7) * INTERVAL '1 day')::DATE AS week_start,
    (input_date - ((EXTRACT(DOW FROM input_date)::INTEGER - start_day + 7) % 7) * INTERVAL '1 day' + INTERVAL '6 days')::DATE AS week_end;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Get habit completion rate
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
  total_days := (p_end_date - p_start_date + 1);
  
  SELECT COUNT(*)
  INTO completed_days
  FROM habit_logs
  WHERE habit_id = p_habit_id
    AND log_date BETWEEN p_start_date AND p_end_date
    AND completed = TRUE;
  
  IF total_days = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_days::NUMERIC / total_days::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function: Validate log date is not in future
CREATE OR REPLACE FUNCTION validate_log_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.log_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create habit log for future date: %', NEW.log_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users;
CREATE TRIGGER trigger_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

DROP TRIGGER IF EXISTS trigger_validate_log_date ON habit_logs;
CREATE TRIGGER trigger_validate_log_date
  BEFORE INSERT OR UPDATE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION validate_log_date();

-- Migration 8: Enable RLS and create policies
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_failure_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_iterations ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- HABIT_FAILURE_PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own failure profiles" ON habit_failure_profiles;
CREATE POLICY "Users can view own failure profiles"
  ON habit_failure_profiles FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own failure profiles" ON habit_failure_profiles;
CREATE POLICY "Users can insert own failure profiles"
  ON habit_failure_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own failure profiles" ON habit_failure_profiles;
CREATE POLICY "Users can update own failure profiles"
  ON habit_failure_profiles FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own failure profiles" ON habit_failure_profiles;
CREATE POLICY "Users can delete own failure profiles"
  ON habit_failure_profiles FOR DELETE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Public can view shared failure profiles" ON habit_failure_profiles;
CREATE POLICY "Public can view shared failure profiles"
  ON habit_failure_profiles FOR SELECT
  USING (share_token IS NOT NULL);

-- HABIT_STACKS POLICIES
DROP POLICY IF EXISTS "Users can view own habit stacks" ON habit_stacks;
CREATE POLICY "Users can view own habit stacks"
  ON habit_stacks FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own habit stacks" ON habit_stacks;
CREATE POLICY "Users can insert own habit stacks"
  ON habit_stacks FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own habit stacks" ON habit_stacks;
CREATE POLICY "Users can update own habit stacks"
  ON habit_stacks FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own habit stacks" ON habit_stacks;
CREATE POLICY "Users can delete own habit stacks"
  ON habit_stacks FOR DELETE
  USING (user_id = auth.uid());

-- HABITS POLICIES
DROP POLICY IF EXISTS "Users can view own habits" ON habits;
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own habits" ON habits;
CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own habits" ON habits;
CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

-- HABIT_LOGS POLICIES
DROP POLICY IF EXISTS "Users can view own habit logs" ON habit_logs;
CREATE POLICY "Users can view own habit logs"
  ON habit_logs FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own habit logs" ON habit_logs;
CREATE POLICY "Users can insert own habit logs"
  ON habit_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own habit logs" ON habit_logs;
CREATE POLICY "Users can update own habit logs"
  ON habit_logs FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own habit logs" ON habit_logs;
CREATE POLICY "Users can delete own habit logs"
  ON habit_logs FOR DELETE
  USING (user_id = auth.uid());

-- WEEKLY_ITERATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own weekly iterations" ON weekly_iterations;
CREATE POLICY "Users can view own weekly iterations"
  ON weekly_iterations FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own weekly iterations" ON weekly_iterations;
CREATE POLICY "Users can insert own weekly iterations"
  ON weekly_iterations FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own weekly iterations" ON weekly_iterations;
CREATE POLICY "Users can update own weekly iterations"
  ON weekly_iterations FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own weekly iterations" ON weekly_iterations;
CREATE POLICY "Users can delete own weekly iterations"
  ON weekly_iterations FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these after migration to verify everything worked
-- ============================================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles', 
    'habit_failure_profiles', 
    'habit_stacks', 
    'habits', 
    'habit_logs', 
    'weekly_iterations'
  )
ORDER BY table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 
    'habit_failure_profiles', 
    'habit_stacks', 
    'habits', 
    'habit_logs', 
    'weekly_iterations'
  );

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
