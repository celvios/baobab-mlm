const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/baobab_mlm'
});

const createAdmin = async () => {
  try {
    const email = 'info@baobaworldwide.com';
    const password = 'BaobabAdmin2025!';
    const fullName = 'Baobab Admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin exists
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('✅ Admin already exists');
      console.log('Email:', email);
      console.log('Password:', password);
      await pool.end();
      process.exit(0);
    }

    // Create admin
    await pool.query(
      'INSERT INTO admins (email, password, full_name, role) VALUES ($1, $2, $3, $4)',
      [email, hashedPassword, fullName, 'super_admin']
    );

    console.log('✅ Admin created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
};

createAdmin();
