const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const createAdmin = async () => {
  try {
    // Create admin tables first
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin already exists
    const existingAdmin = await pool.query('SELECT id FROM admins WHERE email = $1', ['admin@baobabmlm.com']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Baobab2025@', salt);

    // Create admin user
    const result = await pool.query(
      'INSERT INTO admins (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
      ['admin@baobabmlm.com', hashedPassword, 'Baobab Admin', 'super_admin']
    );

    console.log('Admin user created successfully:', result.rows[0]);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

module.exports = createAdmin;