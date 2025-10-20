// Reset user back to Feeder stage
const { Pool } = require('pg');
require('dotenv').config();

const USER_EMAIL = 'forquant002@gmail.com';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/baobab_mlm',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function resetToFeeder() {
  const client = await pool.connect();
  try {
    // Get user
    const user = await client.query('SELECT id FROM users WHERE email = $1', [USER_EMAIL]);
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    const userId = user.rows[0].id;

    // Reset user to feeder stage
    await client.query('UPDATE users SET mlm_level = $1 WHERE id = $2', ['feeder', userId]);
    
    // Update feeder stage_matrix to not complete
    await client.query(`
      UPDATE stage_matrix 
      SET slots_filled = 6, qualified_slots_filled = 6, is_complete = true
      WHERE user_id = $1 AND stage = 'feeder'
    `, [userId]);

    // Reset bronze stage_matrix
    await client.query(`
      UPDATE stage_matrix 
      SET slots_filled = 0, qualified_slots_filled = 0, is_complete = false
      WHERE user_id = $1 AND stage = 'bronze'
    `, [userId]);

    console.log('✅ User reset to Feeder stage');
    console.log('📊 Feeder matrix: 6/6 complete');
    console.log('📊 Bronze matrix: 0/14 (needs 14 Feeder-qualified accounts)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

resetToFeeder();
