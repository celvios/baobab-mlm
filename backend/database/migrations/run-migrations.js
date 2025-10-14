const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Phase 1 migrations...\n');
    
    // Migration 1: Deposit System
    console.log('📦 Running migration 001: Add Deposit System...');
    const migration1 = fs.readFileSync(
      path.join(__dirname, '001_add_deposit_system.sql'),
      'utf8'
    );
    await client.query(migration1);
    console.log('✅ Migration 001 completed\n');
    
    // Migration 2: Matrix Positions
    console.log('📦 Running migration 002: Add Matrix Positions...');
    const migration2 = fs.readFileSync(
      path.join(__dirname, '002_add_matrix_positions.sql'),
      'utf8'
    );
    await client.query(migration2);
    console.log('✅ Migration 002 completed\n');
    
    console.log('🎉 All Phase 1 migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\n💡 To rollback, run: node rollback-migrations.js');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
