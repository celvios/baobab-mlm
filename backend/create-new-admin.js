const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
  try {
    const email = 'info@baobabworldwide.com';
    const password = 'Admin@2024';
    const name = 'Baobab Admin';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO admin_users (name, email, password, role, is_active) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO UPDATE SET password = $3, name = $1',
      [name, email, hashedPassword, 'admin', true]
    );
    
    console.log('✅ Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
