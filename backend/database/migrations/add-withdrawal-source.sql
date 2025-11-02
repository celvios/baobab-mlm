-- Add source column to withdrawal_requests table
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'wallet';

-- Update existing records to have 'wallet' as source
UPDATE withdrawal_requests SET source = 'wallet' WHERE source IS NULL;
