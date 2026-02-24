-- Migration: Add user_id to habits
-- Description: Denormalize user_id for faster queries and API filtering
-- Dependencies: habits, habit_stacks

ALTER TABLE habits
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Backfill from habit_stacks
UPDATE habits
SET user_id = habit_stacks.user_id
FROM habit_stacks
WHERE habits.user_id IS NULL
  AND habits.stack_id = habit_stacks.id;

CREATE INDEX IF NOT EXISTS idx_habits_user_active
  ON habits(user_id, is_active)
  WHERE is_active = TRUE;
