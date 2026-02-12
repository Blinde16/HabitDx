-- Migration: Create habits table
-- Description: Individual habit definitions
-- Dependencies: habit_stacks

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES habit_stacks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Habit details
  title TEXT NOT NULL, -- e.g., "Morning meditation"
  description TEXT,
  rationale TEXT, -- "Why this works for you" AI explanation

  -- Scheduling
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'custom')),
  frequency_days INTEGER[], -- 0=Sun, 1=Mon, etc. for weekly
  reminder_time TIME, -- Time of day for push notification

  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  archived_at TIMESTAMPTZ,

  -- Order in stack
  display_order INTEGER DEFAULT 0 NOT NULL
);

-- Create index on stack_id and is_active for queries
CREATE INDEX idx_habits_stack_active ON habits(stack_id, is_active) WHERE is_active = TRUE;

-- Create index on stack_id for all habits
CREATE INDEX idx_habits_stack_id ON habits(stack_id);

-- Create index on display_order for sorting
CREATE INDEX idx_habits_display_order ON habits(stack_id, display_order);

-- Add comments
COMMENT ON TABLE habits IS 'Individual habit definitions within a habit stack';
COMMENT ON COLUMN habits.rationale IS 'AI-generated explanation of why this habit works for the user';
COMMENT ON COLUMN habits.frequency_days IS 'Array of day numbers (0-6) when habit should be done';
COMMENT ON COLUMN habits.display_order IS 'Order of habit in the stack for UI display';
