-- Deposit requests table migration

CREATE TABLE IF NOT EXISTS deposit_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
    proof_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    approved_by INTEGER REFERENCES admins(id),
    rejected_by INTEGER REFERENCES admins(id),
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_created_at ON deposit_requests(created_at);

-- Update trigger
CREATE OR REPLACE FUNCTION update_deposit_requests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_deposit_requests_timestamp
    BEFORE UPDATE ON deposit_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_deposit_requests_timestamp();