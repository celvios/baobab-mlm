const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runAllMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('========================================');
    console.log('Running All Pending Migrations');
    console.log('========================================\n');
    
    // 1. Exchange Rate Migration
    console.log('[1/3] Exchange Rate Migration...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        currency_code VARCHAR(3) NOT NULL UNIQUE,
        rate DECIMAL(10, 4) NOT NULL,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      INSERT INTO exchange_rates (currency_code, rate) 
      VALUES ('NGN', 1500.00)
      ON CONFLICT (currency_code) DO NOTHING
    `);
    console.log('✅ Exchange rate table created\n');
    
    // 2. Spillover Tracking Migration
    console.log('[2/3] Spillover Tracking Migration...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS spillover_referrals (
        id SERIAL PRIMARY KEY,
        original_referrer_id INTEGER REFERENCES users(id) NOT NULL,
        placement_parent_id INTEGER REFERENCES users(id) NOT NULL,
        referred_user_id INTEGER REFERENCES users(id) NOT NULL,
        stage VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_spillover_placement_parent ON spillover_referrals(placement_parent_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_spillover_original_referrer ON spillover_referrals(original_referrer_id)
    `);
    console.log('✅ Spillover tracking table created\n');
    
    // 3. Withdrawal Source Migration
    console.log('[3/3] Withdrawal Source Migration...');
    await client.query(`
      ALTER TABLE withdrawal_requests 
      ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'balance'
    `);
    console.log('✅ Withdrawal source column added\n');
    
    console.log('========================================');
    console.log('All Migrations Completed Successfully!');
    console.log('========================================\n');
    
    console.log('Features now available:');
    console.log('✓ Exchange rate settings in admin');
    console.log('✓ Spillover referral system');
    console.log('✓ Withdrawal source tracking\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runAllMigrations();
