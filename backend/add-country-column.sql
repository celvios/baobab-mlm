-- Add country column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'NG';

-- Update existing users to have Nigeria as default
UPDATE users SET country = 'NG' WHERE country IS NULL;
