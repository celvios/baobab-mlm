-- Email system tables migration

-- Create email_history table
CREATE TABLE IF NOT EXISTS email_history (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_category VARCHAR(50) DEFAULT 'all',
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create email_recipients table for tracking individual recipients
CREATE TABLE IF NOT EXISTS email_recipients (
    id SERIAL PRIMARY KEY,
    email_history_id INTEGER REFERENCES email_history(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_history_admin_id ON email_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON email_history(status);
CREATE INDEX IF NOT EXISTS idx_email_history_created_at ON email_history(created_at);
CREATE INDEX IF NOT EXISTS idx_email_recipients_email_history_id ON email_recipients(email_history_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_user_id ON email_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON email_recipients(status);

-- Update trigger for email_history
CREATE OR REPLACE FUNCTION update_email_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_history_timestamp
    BEFORE UPDATE ON email_history
    FOR EACH ROW
    EXECUTE FUNCTION update_email_history_timestamp();