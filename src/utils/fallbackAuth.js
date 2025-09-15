// Fallback admin authentication when backend is unavailable
const FALLBACK_ADMIN = {
  email: 'admin@baobab.com',
  password: 'Admin123!',
  name: 'Admin User',
  role: 'super_admin'
};

export const fallbackAdminLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === FALLBACK_ADMIN.email && password === FALLBACK_ADMIN.password) {
        const token = 'fallback_admin_token_' + Date.now();
        resolve({
          message: 'Login successful',
          token,
          admin: {
            id: 1,
            email: FALLBACK_ADMIN.email,
            name: FALLBACK_ADMIN.name,
            role: FALLBACK_ADMIN.role
          }
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 1000);
  });
};