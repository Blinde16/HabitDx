-- Migration: Update habit_failure_profiles table with additional metadata columns
-- Description: Add model_used, tokens_used, raw_response, and updated_at columns
-- Dependencies: 20260212000002_create_habit_failure_profiles.sql

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add model_used column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_failure_profiles' AND column_name = 'model_used'
  ) THEN
    ALTER TABLE habit_failure_profiles ADD COLUMN model_used TEXT;
  END IF;

  -- Add tokens_used column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_failure_profiles' AND column_name = 'tokens_used'
  ) THEN
    ALTER TABLE habit_failure_profiles ADD COLUMN tokens_used INTEGER DEFAULT 0;
  END IF;

  -- Add raw_response column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_failure_profiles' AND column_name = 'raw_response'
  ) THEN
    ALTER TABLE habit_failure_profiles ADD COLUMN raw_response TEXT;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'habit_failure_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE habit_failure_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Add comments
COMMENT ON COLUMN habit_failure_profiles.model_used IS 'AI model used to generate profile (e.g., gpt-4o-mini)';
COMMENT ON COLUMN habit_failure_profiles.tokens_used IS 'Number of OpenAI tokens consumed';
COMMENT ON COLUMN habit_failure_profiles.raw_response IS 'Raw JSON response from AI for debugging and iteration';
COMMENT ON COLUMN habit_failure_profiles.updated_at IS 'Timestamp of last update';

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_habit_failure_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_habit_failure_profiles_updated_at ON habit_failure_profiles;

CREATE TRIGGER trigger_update_habit_failure_profiles_updated_at
  BEFORE UPDATE ON habit_failure_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_failure_profiles_updated_at();
