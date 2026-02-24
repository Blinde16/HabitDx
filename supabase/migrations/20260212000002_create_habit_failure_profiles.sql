-- Migration: Create habit_failure_profiles table
-- Description: AI-generated diagnosis of user's failure patterns
-- Dependencies: user_profiles

CREATE TABLE IF NOT EXISTS habit_failure_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- AI Analysis
  failure_patterns TEXT[], -- e.g., ["evening energy crashes", "weekend disruption"]
  root_causes TEXT[], -- e.g., ["Poor sleep schedule", "No morning routine"]
  personality_insights JSONB, -- Structured AI analysis
  recommendations TEXT[], -- High-level suggestions

  -- Shareability
  share_token TEXT UNIQUE, -- For public sharing
  view_count INTEGER DEFAULT 0 NOT NULL,

  -- Versioning
  version INTEGER DEFAULT 1 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create unique index to ensure only one active profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_habit_failure_profiles_user_active 
  ON habit_failure_profiles(user_id) 
  WHERE is_active = TRUE;

-- Create index on share_token for public access
CREATE INDEX IF NOT EXISTS idx_habit_failure_profiles_share_token ON habit_failure_profiles(share_token) WHERE share_token IS NOT NULL;

-- Create index on user_id for queries
CREATE INDEX IF NOT EXISTS idx_habit_failure_profiles_user_id ON habit_failure_profiles(user_id);

-- Add comments
COMMENT ON TABLE habit_failure_profiles IS 'AI-generated analysis of user habit failure patterns';
COMMENT ON COLUMN habit_failure_profiles.share_token IS 'Unique token for public sharing of failure profile';
COMMENT ON COLUMN habit_failure_profiles.is_active IS 'Only one active profile per user allowed';
