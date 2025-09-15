// Fallback admin authentication when backend is unavailable
const FALLBACK_ADMIN = {
  email: 'admin',
  password: 'admin',
  name: 'Admin User',
  role: 'super_admin'
};

const FALLBACK_ADMINS = [
  { email: 'admin@baobab.com', password: 'admin123' },
  { email: 'admin@baobabmlm.com', password: 'Baobab2025@' },
  { email: 'baobab@admin.com', password: 'baobab2025' }
];

export const fallbackAdminLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const validAdmin = FALLBACK_ADMINS.find(admin => 
        admin.email.toLowerCase() === email.toLowerCase() && 
        admin.password === password
      );
      
      if (validAdmin) {
        const token = 'fallback_admin_token_' + Date.now();
        resolve({
          message: 'Login successful',
          token,
          admin: {
            id: 1,
            email: validAdmin.email,
            name: 'Admin User',
            role: 'super_admin'
          }
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};