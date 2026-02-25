-- Migration: Add generation_rationale to habit_stacks
-- Description: Store AI rationale for the generated stack
-- Dependencies: habit_stacks

ALTER TABLE habit_stacks
ADD COLUMN IF NOT EXISTS generation_rationale TEXT;
