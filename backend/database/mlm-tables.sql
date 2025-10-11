-- MLM Matrix table
CREATE TABLE IF NOT EXISTS mlm_matrix (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    parent_id INTEGER REFERENCES users(id),
    position VARCHAR(10),
    level INTEGER DEFAULT 1,
    left_child_id INTEGER REFERENCES users(id),
    right_child_id INTEGER REFERENCES users(id),
    is_complete BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral earnings table
CREATE TABLE IF NOT EXISTS referral_earnings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    referred_user_id INTEGER REFERENCES users(id) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Level progressions table
CREATE TABLE IF NOT EXISTS level_progressions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    from_stage VARCHAR(50) NOT NULL,
    to_stage VARCHAR(50) NOT NULL,
    matrix_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stage matrix tracking (tracks completion per stage)
CREATE TABLE IF NOT EXISTS stage_matrix (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    slots_filled INTEGER DEFAULT 0,
    slots_required INTEGER NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, stage)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mlm_matrix_user ON mlm_matrix(user_id);
CREATE INDEX IF NOT EXISTS idx_mlm_matrix_stage ON mlm_matrix(stage);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_user ON referral_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_matrix_user ON stage_matrix(user_id);
