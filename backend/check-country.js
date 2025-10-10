const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkCountry() {
  try {
    // Check if column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='country'
    `);
    
    console.log('Country column exists:', columnCheck.rows.length > 0);
    
    // Check user countries
    const users = await pool.query('SELECT id, email, country FROM users LIMIT 5');
    console.log('\nUser countries:');
    users.rows.forEach(u => console.log(`- ${u.email}: ${u.country || 'NULL'}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCountry();
