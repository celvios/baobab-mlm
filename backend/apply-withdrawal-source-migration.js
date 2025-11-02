const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'database/migrations/add-withdrawal-source.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Withdrawal source migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
