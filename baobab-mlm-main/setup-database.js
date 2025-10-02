require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database tables...');
    
    // Run email migration
    const emailMigration = fs.readFileSync('./email_system_migration.sql', 'utf8');
    await pool.query(emailMigration);
    console.log('✅ Email system tables created');
    
    // Create missing tables
    const createTables = `
      -- Admin activity logs table
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Ensure transactions table has admin_id column
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_id INTEGER;
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference VARCHAR(100);
      
      -- Ensure withdrawal_requests table exists
      CREATE TABLE IF NOT EXISTS withdrawal_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          admin_notes TEXT,
          admin_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP
      );
      
      -- Ensure wallets table has proper columns
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS total_withdrawn DECIMAL(10,2) DEFAULT 0;
      ALTER TABLE wallets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `;
    
    await pool.query(createTables);
    console.log('✅ All database tables ready');
    
    // Verify setup
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:', tables.rows.map(r => r.table_name).join(', '));
    
    await pool.end();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();