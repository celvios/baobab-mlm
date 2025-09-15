const bcrypt = require('bcryptjs');

const createAdminCredentials = async () => {
  const email = 'admin@baobab.com';
  const password = 'Admin123!';
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('=== NEW ADMIN CREDENTIALS ===');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
  console.log('\n=== SQL TO CREATE ADMIN ===');
  console.log(`INSERT INTO admins (email, password, name, role, is_active) VALUES ('${email}', '${hashedPassword}', 'Admin User', 'super_admin', true);`);
};

createAdminCredentials().catch(console.error);