const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function createAdmin() {
  try {
    // Check if admin table exists, create if not
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin exists
    const existingAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@baobab.com']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin
    await pool.query(
      'INSERT INTO admins (email, password, name, role) VALUES ($1, $2, $3, $4)',
      ['admin@baobab.com', hashedPassword, 'Admin User', 'admin']
    );

    console.log('Admin created successfully!');
    console.log('Email: admin@baobab.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();