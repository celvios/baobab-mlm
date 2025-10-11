// Fallback admin authentication - DO NOT USE IN PRODUCTION
// Configure proper admin accounts in the database

export const fallbackAdminLogin = (email, password) => {
  return Promise.reject(new Error('Fallback authentication disabled. Please use database authentication.'));
};