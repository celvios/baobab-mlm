-- Add source column to track withdrawal type
ALTER TABLE withdrawal_requests 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'balance';

-- source can be: 'balance' (wallet overview) or 'earnings' (MLM earnings)
COMMENT ON COLUMN withdrawal_requests.source IS 'Source of withdrawal: balance or earnings';
