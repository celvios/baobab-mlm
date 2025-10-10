const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  try {
    console.log('Running country column migration...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'add-country-column.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Country column added to users table');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
