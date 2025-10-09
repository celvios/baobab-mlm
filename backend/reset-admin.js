const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/baobab_mlm'
});

const resetAdmin = async () => {
  try {
    // Delete all admins
    await pool.query('DELETE FROM admins');
    console.log('✅ All admins deleted');

    // Create new admin
    const email = 'info@baobaworldwide.com';
    const password = 'BaobabAdmin2025!';
    const fullName = 'Baobab Admin';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

resetAdmin();
