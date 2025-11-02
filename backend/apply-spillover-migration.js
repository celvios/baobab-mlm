const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Applying spillover tracking migration...');
    
    const migrationPath = path.join(__dirname, 'database', 'migrations', 'add-spillover-tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Spillover tracking migration applied successfully!');
    console.log('\nNew features:');
    console.log('- Spillover referrals are now tracked in the database');
    console.log('- Placement parents receive email notifications for spillover members');
    console.log('- Spillover members appear in the placement parent\'s team dashboard');
    console.log('- Original referrer still receives all bonuses');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

applyMigration();
