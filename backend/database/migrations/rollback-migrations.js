const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function rollbackMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('⚠️  Starting rollback...\n');
    
    const rollback = fs.readFileSync(
      path.join(__dirname, '003_rollback.sql'),
      'utf8'
    );
    await client.query(rollback);
    
    console.log('✅ Rollback completed successfully!');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

rollbackMigrations();
