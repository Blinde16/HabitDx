-- Migration: Add addresses_pattern to habits
-- Description: Links each habit to a failure pattern it addresses
-- Dependencies: habits

ALTER TABLE habits
ADD COLUMN IF NOT EXISTS addresses_pattern TEXT;
