-- Migration: Relax habit_logs date validation
-- The original trigger rejects any log_date > CURRENT_DATE, which blocks
-- dev-mode time-travel testing. Replace with a wider 90-day future window
-- so production still catches wildly incorrect dates while allowing the
-- dev date override to work.

CREATE OR REPLACE FUNCTION validate_log_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.log_date > CURRENT_DATE + INTERVAL '90 days' THEN
    RAISE EXCEPTION 'Cannot create habit log more than 90 days in the future: %', NEW.log_date;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
