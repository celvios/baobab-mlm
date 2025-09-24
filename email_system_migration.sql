-- Email system migration
-- Create email_history table if it doesn't exist

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_history_admin_id ON email_history(admin_id);
CREATE INDEX IF NOT EXISTS idx_email_history_created_at ON email_history(created_at);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON email_history(status);

-- Add email subscription column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_subscribed BOOLEAN DEFAULT true;

-- Add sent_count and failed_count columns to email_history if they don't exist
ALTER TABLE email_history ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0;
ALTER TABLE email_history ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;

-- Update existing email_history records to have proper counts
UPDATE email_history 
SET sent_count = recipient_count, failed_count = 0 
WHERE sent_count IS NULL OR sent_count = 0;