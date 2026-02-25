-- Migration: Add based_on_profile_id to habit_stacks
-- Description: Link habit stacks to the failure profile used for generation
-- Dependencies: habit_stacks, habit_failure_profiles

ALTER TABLE habit_stacks
ADD COLUMN IF NOT EXISTS based_on_profile_id UUID REFERENCES habit_failure_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_habit_stacks_based_on_profile_id
  ON habit_stacks(based_on_profile_id)
  WHERE based_on_profile_id IS NOT NULL;
