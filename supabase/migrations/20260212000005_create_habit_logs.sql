-- Migration: Create habit_logs table
-- Description: Daily check-in records for habit completion
-- Dependencies: habits, user_profiles

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Check-in data
  log_date DATE NOT NULL,
  completed BOOLEAN NOT NULL,
  obstacle TEXT, -- Optional: what blocked completion

  -- Metadata
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  checked_in_via TEXT DEFAULT 'app' NOT NULL CHECK (checked_in_via IN ('app', 'notification', 'widget')),

  -- Ensure one log per habit per day
  UNIQUE(habit_id, log_date)
);

-- Create unique index on habit_id and log_date
CREATE UNIQUE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, log_date);

-- Create index on user_id and log_date for user queries
CREATE INDEX idx_habit_logs_user_date ON habit_logs(user_id, log_date DESC);

-- Create index on habit_id for habit-specific queries
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);

-- Create index on log_date for date range queries
CREATE INDEX idx_habit_logs_date ON habit_logs(log_date DESC);

-- Add comments
COMMENT ON TABLE habit_logs IS 'Daily check-in records tracking habit completion';
COMMENT ON COLUMN habit_logs.obstacle IS 'User-provided reason for not completing the habit';
COMMENT ON COLUMN habit_logs.checked_in_via IS 'Source of the check-in (app, notification, widget)';
