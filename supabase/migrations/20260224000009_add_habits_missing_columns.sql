-- Migration: Add missing columns to habits table
-- Description: The edge function inserts columns that don't exist in the
--   original schema. Add them so the AI-generated habits can be stored.
-- Dependencies: habits

-- "name" is used by the edge function instead of "title"
ALTER TABLE habits ADD COLUMN IF NOT EXISTS name TEXT;

-- Tiny Habits fields
ALTER TABLE habits ADD COLUMN IF NOT EXISTS tiny_version TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS anchor TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS celebration TEXT;

-- Scheduling: days_of_week replaces frequency_days for the edge function
ALTER TABLE habits ADD COLUMN IF NOT EXISTS days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}';

-- Reminder toggle
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE;

-- Backfill name from title where name is null
UPDATE habits SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Make frequency_type nullable since the edge function doesn't provide it
ALTER TABLE habits ALTER COLUMN frequency_type DROP NOT NULL;

-- Drop the CHECK constraint on frequency_type so it doesn't block inserts
-- that omit the column
ALTER TABLE habits DROP CONSTRAINT IF EXISTS habits_frequency_type_check;

-- updated_at for habit edits (used by iterationStore and notificationService)
ALTER TABLE habits ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
