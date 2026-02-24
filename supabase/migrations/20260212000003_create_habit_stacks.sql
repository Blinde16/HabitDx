-- Migration: Create habit_stacks table
-- Description: Collection of habits for a user
-- Dependencies: user_profiles, habit_failure_profiles

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
  generation_context JSONB -- Original prompt/constraints used
);

-- Create unique index to ensure only one active stack per user
CREATE UNIQUE INDEX idx_habit_stacks_user_active 
  ON habit_stacks(user_id) 
  WHERE is_active = TRUE;

-- Create index on user_id for queries
CREATE INDEX idx_habit_stacks_user_id ON habit_stacks(user_id);

-- Create index on failure_profile_id for joins
CREATE INDEX idx_habit_stacks_failure_profile_id ON habit_stacks(failure_profile_id) WHERE failure_profile_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE habit_stacks IS 'Collection of habits grouped together for a user';
COMMENT ON COLUMN habit_stacks.generation_context IS 'JSON containing the original AI prompt and constraints used to generate this stack';
COMMENT ON COLUMN habit_stacks.is_active IS 'Only one active stack per user allowed';
