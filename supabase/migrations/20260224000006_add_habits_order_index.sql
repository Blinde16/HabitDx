-- Migration: Add order_index to habits
-- Description: Support ordering habits per user in API queries
-- Dependencies: habits

ALTER TABLE habits
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Backfill from display_order when available
UPDATE habits
SET order_index = display_order
WHERE order_index = 0
  AND display_order IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_habits_user_order
  ON habits(user_id, order_index);
