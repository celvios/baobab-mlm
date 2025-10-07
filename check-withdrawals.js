require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkWithdrawals() {
  try {
    const result = await pool.query(`
      SELECT wr.*, u.full_name, u.email 
      FROM withdrawal_requests wr
      LEFT JOIN users u ON wr.user_id = u.id
      ORDER BY wr.created_at DESC
    `);
    
    console.log('\n=== WITHDRAWAL REQUESTS ===');
    console.log('Total:', result.rows.length);
    console.log('\nDetails:');
    result.rows.forEach((row, i) => {
      console.log(`\n${i + 1}. ID: ${row.id}`);
      console.log(`   User: ${row.full_name} (${row.email})`);
      console.log(`   Amount: ₦${row.amount}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Created: ${row.created_at}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkWithdrawals();
