-- Migration: Add version to habit_stacks
-- Description: Track version of generated habit stacks
-- Dependencies: habit_stacks

ALTER TABLE habit_stacks
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
