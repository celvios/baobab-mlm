const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixWithdrawalTable() {
  try {
    const client = await pool.connect();
    
    console.log('Creating withdrawal_requests table...');
    
    // Create withdrawal_requests table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        admin_notes TEXT,
        processed_at TIMESTAMP,
        processed_by INTEGER REFERENCES admin_users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add indexes for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at)');
    
    console.log('withdrawal_requests table created successfully!');
    
    // Also ensure other required tables exist
    console.log('Checking other required tables...');
    
    // Create admin_users table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create settings table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default settings if they don't exist
    const settingsCheck = await client.query('SELECT COUNT(*) FROM settings');
    if (parseInt(settingsCheck.rows[0].count) === 0) {
      console.log('Inserting default settings...');
      await client.query(`
        INSERT INTO settings (key, value) VALUES 
        ('business_name', 'Baobab MLM'),
        ('business_email', 'info@baobabmlm.com'),
        ('business_phone', '+234 123 456 7890'),
        ('business_address', 'Lagos, Nigeria'),
        ('bank_name', 'First Bank'),
        ('account_name', 'Baobab MLM Ltd'),
        ('account_number', '1234567890'),
        ('joining_fee', '18000')
      `);
    }
    
    // Create payment_confirmations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_confirmations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        proof_url VARCHAR(500),
        confirmed_by INTEGER REFERENCES admin_users(id),
        confirmed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        type VARCHAR(50) DEFAULT 'joining_fee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    client.release();
    console.log('Database fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database fix error:', error);
    process.exit(1);
  }
}

fixWithdrawalTable();