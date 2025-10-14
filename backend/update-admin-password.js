const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

const updateAdminPassword = async () => {
  try {
    const email = 'info@baobabworldwide.com';
    const newPassword = 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await pool.query(
      'UPDATE admins SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, name',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin not found!');
    } else {
      console.log('✅ Password updated successfully!');
      console.log('\n📧 Email:', email);
      console.log('🔑 Password:', newPassword);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateAdminPassword();
