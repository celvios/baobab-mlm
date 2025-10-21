-- Clean up duplicate deposit requests
-- This script keeps only the FIRST deposit request from each user

BEGIN;

-- Step 1: Show duplicates before cleanup (for verification)
SELECT user_id, COUNT(*) as deposit_count
FROM deposit_requests
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicate deposits, keeping only the first one per user
DELETE FROM deposit_requests 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM deposit_requests 
  GROUP BY user_id
);

-- Step 3: Add unique constraint to prevent future duplicates
-- Note: This will fail if duplicates still exist
ALTER TABLE deposit_requests 
ADD CONSTRAINT unique_user_deposit 
UNIQUE (user_id);

-- Step 4: Verify cleanup
SELECT user_id, COUNT(*) as deposit_count
FROM deposit_requests
GROUP BY user_id
HAVING COUNT(*) > 1;

COMMIT;
