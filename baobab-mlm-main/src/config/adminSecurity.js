// Admin Security Configuration
export const ADMIN_SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
};

export const getSecurityHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Requested-With': 'XMLHttpRequest',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
});

export const validateAdminInput = (input, type) => {
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s-()]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };
  
  if (!input || typeof input !== 'string') return false;
  
  switch (type) {
    case 'email':
      return patterns.email.test(input.trim());
    case 'phone':
      return patterns.phone.test(input.trim());
    case 'password':
      return patterns.password.test(input);
    default:
      return input.trim().length > 0;
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, '').replace(/javascript:/gi, '').trim();
};