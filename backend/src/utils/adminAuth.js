import { ADMIN_SECURITY_CONFIG } from '../config/adminSecurity';

class AdminAuthManager {
  constructor() {
    this.loginAttempts = new Map();
    this.sessionTimeout = null;
  }

  isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (!token || !adminUser) return false;
    
    try {
      const user = JSON.parse(adminUser);
      const tokenExpiry = user.tokenExpiry;
      
      if (tokenExpiry && Date.now() > tokenExpiry) {
        this.logout();
        return false;
      }
      
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  trackLoginAttempt(email, success = false) {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    
    if (success) {
      this.loginAttempts.delete(email);
      return true;
    }
    
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(email, attempts);
    
    return attempts.count < ADMIN_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS;
  }

  isAccountLocked(email) {
    const attempts = this.loginAttempts.get(email);
    if (!attempts || attempts.count < ADMIN_SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      return false;
    }
    
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
    if (timeSinceLastAttempt > ADMIN_SECURITY_CONFIG.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email);
      return false;
    }
    
    return true;
  }

  setSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
    
    this.sessionTimeout = setTimeout(() => {
      this.logout();
      window.location.href = '/admin/login';
    }, ADMIN_SECURITY_CONFIG.SESSION_TIMEOUT);
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }

  validateToken(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3;
  }
}

export const adminAuth = new AdminAuthManager();