-- Migration: Create user_profiles table
-- Description: Extended user data beyond Supabase auth.users
-- Dependencies: None (references auth.users)

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Onboarding data
  past_failures TEXT[], -- Array of past habit attempts
  constraints JSONB, -- Schedule, energy patterns, life constraints
  goals TEXT[], -- User's habit goals
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,

  -- Settings
  timezone TEXT DEFAULT 'America/New_York' NOT NULL,
  notification_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  weekly_iteration_day INTEGER DEFAULT 1 CHECK (weekly_iteration_day >= 0 AND weekly_iteration_day <= 6) -- 0=Sun, 1=Mon, etc.
);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE user_profiles IS 'Extended user profile data beyond auth.users';
COMMENT ON COLUMN user_profiles.past_failures IS 'Array of past habit attempts that failed';
COMMENT ON COLUMN user_profiles.constraints IS 'JSON object containing schedule, energy patterns, and life constraints';
COMMENT ON COLUMN user_profiles.weekly_iteration_day IS 'Day of week for weekly iteration (0=Sunday, 1=Monday, etc.)';
