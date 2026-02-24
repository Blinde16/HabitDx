-- Migration: Create Row Level Security policies
-- Description: Implement RLS for data isolation and security
-- Dependencies: All table migrations

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_failure_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_iterations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER_PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if needed)
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- HABIT_FAILURE_PROFILES POLICIES
-- ============================================================================

-- Users can view their own failure profiles
CREATE POLICY "Users can view own failure profiles"
  ON habit_failure_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own failure profiles
CREATE POLICY "Users can insert own failure profiles"
  ON habit_failure_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own failure profiles
CREATE POLICY "Users can update own failure profiles"
  ON habit_failure_profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own failure profiles
CREATE POLICY "Users can delete own failure profiles"
  ON habit_failure_profiles
  FOR DELETE
  USING (user_id = auth.uid());

-- Public can view shared failure profiles (via share_token)
CREATE POLICY "Public can view shared failure profiles"
  ON habit_failure_profiles
  FOR SELECT
  USING (share_token IS NOT NULL);

-- ============================================================================
-- HABIT_STACKS POLICIES
-- ============================================================================

-- Users can view their own habit stacks
CREATE POLICY "Users can view own habit stacks"
  ON habit_stacks
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own habit stacks
CREATE POLICY "Users can insert own habit stacks"
  ON habit_stacks
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own habit stacks
CREATE POLICY "Users can update own habit stacks"
  ON habit_stacks
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own habit stacks
CREATE POLICY "Users can delete own habit stacks"
  ON habit_stacks
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- HABITS POLICIES
-- ============================================================================

-- Users can view their own habits (via stack ownership)
CREATE POLICY "Users can view own habits"
  ON habits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

-- Users can insert habits into their own stacks
CREATE POLICY "Users can insert own habits"
  ON habits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

-- Users can update their own habits
CREATE POLICY "Users can update own habits"
  ON habits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

-- Users can delete their own habits
CREATE POLICY "Users can delete own habits"
  ON habits
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM habit_stacks
      WHERE habit_stacks.id = habits.stack_id
      AND habit_stacks.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HABIT_LOGS POLICIES
-- ============================================================================

-- Users can view their own habit logs
CREATE POLICY "Users can view own habit logs"
  ON habit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own habit logs
CREATE POLICY "Users can insert own habit logs"
  ON habit_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own habit logs
CREATE POLICY "Users can update own habit logs"
  ON habit_logs
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own habit logs
CREATE POLICY "Users can delete own habit logs"
  ON habit_logs
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- WEEKLY_ITERATIONS POLICIES
-- ============================================================================

-- Users can view their own weekly iterations
CREATE POLICY "Users can view own weekly iterations"
  ON weekly_iterations
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own weekly iterations
CREATE POLICY "Users can insert own weekly iterations"
  ON weekly_iterations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own weekly iterations
CREATE POLICY "Users can update own weekly iterations"
  ON weekly_iterations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own weekly iterations
CREATE POLICY "Users can delete own weekly iterations"
  ON weekly_iterations
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Users can only view their own profile data';
COMMENT ON POLICY "Public can view shared failure profiles" ON habit_failure_profiles IS 'Allows public access to failure profiles via share token';
COMMENT ON POLICY "Users can view own habits" ON habits IS 'Users can view habits that belong to their stacks';
