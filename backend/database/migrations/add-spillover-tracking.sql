-- Add spillover tracking table
CREATE TABLE IF NOT EXISTS spillover_referrals (
    id SERIAL PRIMARY KEY,
    original_referrer_id INTEGER REFERENCES users(id) NOT NULL,
    placement_parent_id INTEGER REFERENCES users(id) NOT NULL,
    referred_user_id INTEGER REFERENCES users(id) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_spillover_placement_parent ON spillover_referrals(placement_parent_id);
CREATE INDEX IF NOT EXISTS idx_spillover_original_referrer ON spillover_referrals(original_referrer_id);
CREATE INDEX IF NOT EXISTS idx_spillover_referred_user ON spillover_referrals(referred_user_id);

-- Add comment
COMMENT ON TABLE spillover_referrals IS 'Tracks spillover referrals where the placement parent differs from the original referrer';
