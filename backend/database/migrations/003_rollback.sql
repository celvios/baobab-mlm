-- Rollback Script
-- Use this to undo migrations if needed

-- Rollback 002: Remove matrix positions
DROP INDEX IF EXISTS idx_stage_matrix_complete;
DROP INDEX IF EXISTS idx_matrix_positions_stage;
DROP INDEX IF EXISTS idx_matrix_positions_parent;
DROP INDEX IF EXISTS idx_matrix_positions_user;

ALTER TABLE stage_matrix DROP COLUMN IF EXISTS required_completed_accounts;
ALTER TABLE stage_matrix DROP COLUMN IF EXISTS completed_accounts_count;

DROP TABLE IF EXISTS matrix_positions;

-- Rollback 001: Remove deposit system
DROP INDEX IF EXISTS idx_users_deposit_confirmed;
DROP INDEX IF EXISTS idx_users_dashboard_unlocked;
DROP INDEX IF EXISTS idx_deposit_requests_status;
DROP INDEX IF EXISTS idx_deposit_requests_user;

DROP TABLE IF EXISTS deposit_requests;

ALTER TABLE users ALTER COLUMN mlm_level SET DEFAULT 'feeder';
ALTER TABLE users DROP COLUMN IF EXISTS dashboard_unlocked;
ALTER TABLE users DROP COLUMN IF EXISTS deposit_confirmed_at;
ALTER TABLE users DROP COLUMN IF EXISTS deposit_confirmed;
ALTER TABLE users DROP COLUMN IF EXISTS deposit_amount;
