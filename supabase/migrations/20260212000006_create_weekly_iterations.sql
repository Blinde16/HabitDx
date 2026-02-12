-- Migration: Create weekly_iterations table
-- Description: AI-generated weekly insights and adjustments
-- Dependencies: user_profiles, habit_stacks

CREATE TABLE IF NOT EXISTS weekly_iterations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  stack_id UUID REFERENCES habit_stacks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Week metadata
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL CHECK (week_end_date > week_start_date),

  -- AI Analysis
  patterns_detected TEXT[], -- What the AI noticed
  success_rate JSONB, -- Per-habit completion rates
  adjustment_suggestion TEXT NOT NULL, -- The ONE adjustment
  adjustment_rationale TEXT, -- Why this adjustment

  -- User interaction
  user_response TEXT CHECK (user_response IN ('accepted', 'declined', 'pending')),
  responded_at TIMESTAMPTZ,

  -- Implementation
  implemented BOOLEAN DEFAULT FALSE NOT NULL,
  implementation_notes TEXT
);

-- Create index on user_id and week_start_date for queries
CREATE INDEX idx_weekly_iterations_user_week ON weekly_iterations(user_id, week_start_date DESC);

-- Create index on user_id for user-specific queries
CREATE INDEX idx_weekly_iterations_user_id ON weekly_iterations(user_id);

-- Create index on stack_id for stack-specific queries
CREATE INDEX idx_weekly_iterations_stack_id ON weekly_iterations(stack_id) WHERE stack_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE weekly_iterations IS 'AI-generated weekly insights and habit adjustment suggestions';
COMMENT ON COLUMN weekly_iterations.adjustment_suggestion IS 'The single most important adjustment suggested by AI';
COMMENT ON COLUMN weekly_iterations.user_response IS 'User decision on whether to accept the suggested adjustment';
COMMENT ON COLUMN weekly_iterations.implemented IS 'Whether the adjustment was actually implemented';
