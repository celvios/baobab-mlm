const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('Running orders table migration...');
    
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'backend', 'orders_migration.sql'), 'utf8');
    
    const client = await pool.connect();
    await client.query(migrationSQL);
    client.release();
    
    console.log('Migration completed successfully!');
    console.log('Orders table and indexes have been created.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();