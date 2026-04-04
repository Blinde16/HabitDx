-- Align weekly_iterations with the app + weekly-iteration Edge Function when the table
-- was created only from 20260212000006_create_weekly_iterations.sql.
-- 20260216000002_weekly_iterations.sql uses CREATE TABLE IF NOT EXISTS, so it skipped
-- adding week_start, completion_stats, insights, etc. when the table already existed.

-- ---------------------------------------------------------------------------
-- New columns (Edge Function + client expect these)
-- ---------------------------------------------------------------------------
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS week_start TIMESTAMPTZ;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS week_end TIMESTAMPTZ;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS completion_stats JSONB;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS insights TEXT;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS generation_time_ms INTEGER DEFAULT 0;
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS adjustment_recommendation JSONB;

-- ---------------------------------------------------------------------------
-- Legacy: patterns_detected was TEXT[]; app + function use JSONB array
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'weekly_iterations'
      AND c.column_name = 'patterns_detected'
      AND c.data_type = 'ARRAY'
  ) THEN
    ALTER TABLE weekly_iterations ADD COLUMN patterns_detected_new JSONB DEFAULT '[]'::jsonb;
    UPDATE weekly_iterations
    SET patterns_detected_new = COALESCE(to_jsonb(patterns_detected), '[]'::jsonb);
    ALTER TABLE weekly_iterations DROP COLUMN patterns_detected;
    ALTER TABLE weekly_iterations RENAME COLUMN patterns_detected_new TO patterns_detected;
  END IF;
END $$;

ALTER TABLE weekly_iterations ADD COLUMN IF NOT EXISTS patterns_detected JSONB DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Relax legacy NOT NULL columns so inserts only need the new shape
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations' AND column_name = 'week_start_date'
  ) THEN
    ALTER TABLE weekly_iterations ALTER COLUMN week_start_date DROP NOT NULL;
    ALTER TABLE weekly_iterations ALTER COLUMN week_end_date DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations' AND column_name = 'adjustment_suggestion'
  ) THEN
    ALTER TABLE weekly_iterations ALTER COLUMN adjustment_suggestion DROP NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Backfill new columns from legacy where present
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations' AND column_name = 'week_start_date'
  ) THEN
    UPDATE weekly_iterations SET
      week_start = COALESCE(week_start, week_start_date::timestamptz),
      week_end = COALESCE(week_end, week_end_date::timestamptz)
    WHERE week_start IS NULL OR week_end IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations' AND column_name = 'success_rate'
  ) THEN
    UPDATE weekly_iterations
    SET completion_stats = COALESCE(completion_stats, success_rate, '{}'::jsonb)
    WHERE completion_stats IS NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations' AND column_name = 'adjustment_suggestion'
  ) THEN
    UPDATE weekly_iterations
    SET insights = COALESCE(NULLIF(trim(insights), ''), adjustment_suggestion, 'Weekly insight')
    WHERE insights IS NULL OR trim(COALESCE(insights, '')) = '';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Enforce NOT NULL on columns the Edge Function always sets (when nullable)
-- ---------------------------------------------------------------------------
UPDATE weekly_iterations SET completion_stats = '{}'::jsonb WHERE completion_stats IS NULL;
UPDATE weekly_iterations SET patterns_detected = '[]'::jsonb WHERE patterns_detected IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations'
      AND column_name = 'completion_stats' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE weekly_iterations ALTER COLUMN completion_stats SET DEFAULT '{}'::jsonb;
    ALTER TABLE weekly_iterations ALTER COLUMN completion_stats SET NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'weekly_iterations'
      AND column_name = 'insights' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE weekly_iterations ALTER COLUMN insights SET DEFAULT '';
    UPDATE weekly_iterations SET insights = '' WHERE insights IS NULL;
    ALTER TABLE weekly_iterations ALTER COLUMN insights SET NOT NULL;
  END IF;
END $$;

-- Policies from 20260216000002 (names differ from 008); idempotent
DROP POLICY IF EXISTS "Users can view their own iterations" ON weekly_iterations;
CREATE POLICY "Users can view their own iterations"
  ON weekly_iterations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own iterations" ON weekly_iterations;
CREATE POLICY "Users can insert their own iterations"
  ON weekly_iterations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own iterations" ON weekly_iterations;
CREATE POLICY "Users can update their own iterations"
  ON weekly_iterations FOR UPDATE
  USING (auth.uid() = user_id);
