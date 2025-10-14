const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

const createNewAdmin = async () => {
  try {
    const email = 'info@baobabworldwide.com';
    const password = 'Baobab2025!';
    const name = 'Baobab Admin';

    // Check if admin exists
    const existing = await pool.query('SELECT id FROM admins WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('Admin already exists. Updating password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await pool.query(
        'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
        [hashedPassword, email]
      );
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('Creating new admin...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const result = await pool.query(
        'INSERT INTO admins (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
        [email, hashedPassword, name, 'super_admin']
      );

      console.log('✅ Admin created successfully!');
      console.log(result.rows[0]);
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\nYou can now login at: https://baobab-mlm.onrender.com/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createNewAdmin();
