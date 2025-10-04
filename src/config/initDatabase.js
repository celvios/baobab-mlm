const pool = require('./database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database tables...');
    
    // Create admin_activity_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create email_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_history (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          subject VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          recipient_category VARCHAR(50) DEFAULT 'all',
          recipient_count INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to existing tables
    await pool.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_id INTEGER;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference VARCHAR(100);
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  }
};

module.exports = initDatabase;