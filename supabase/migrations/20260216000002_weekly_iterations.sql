-- Create weekly_iterations table
CREATE TABLE IF NOT EXISTS weekly_iterations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  completion_stats JSONB NOT NULL,
  patterns_detected JSONB DEFAULT '[]'::jsonb,
  adjustment_recommendation JSONB,
  insights TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  generation_time_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_weekly_iterations_user_id ON weekly_iterations(user_id);
CREATE INDEX idx_weekly_iterations_created_at ON weekly_iterations(created_at DESC);
CREATE INDEX idx_weekly_iterations_status ON weekly_iterations(status);

-- Enable RLS
ALTER TABLE weekly_iterations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own iterations"
  ON weekly_iterations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own iterations"
  ON weekly_iterations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own iterations"
  ON weekly_iterations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add notification_id column to habits table (for tracking scheduled notifications)
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS notification_id TEXT;

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for weekly_iterations
CREATE TRIGGER update_weekly_iterations_updated_at
  BEFORE UPDATE ON weekly_iterations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
