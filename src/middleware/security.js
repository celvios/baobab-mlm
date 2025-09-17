const helmet = require('helmet');
const { logSecurityEvent } = require('../controllers/adminAuditController');

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// IP whitelist middleware
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!allowedIPs.includes(clientIP)) {
      logSecurityEvent('ip_blocked', 'medium', `Blocked request from unauthorized IP: ${clientIP}`, clientIP);
      return res.status(403).json({ message: 'Access denied from this IP address' });
    }

    next();
  };
};

// Suspicious activity detection
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/proc\/|\/sys\/)/i, // Path traversal
    /(union|select|insert|update|delete|drop|create|alter)/i, // SQL injection
    /(<script|javascript:|vbscript:|onload=|onerror=)/i, // XSS
    /(eval\(|setTimeout\(|setInterval\()/i // Code injection
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl;
  const body = JSON.stringify(req.body);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body) || pattern.test(userAgent)) {
      logSecurityEvent(
        'suspicious_activity', 
        'high', 
        `Suspicious activity detected from IP: ${req.ip}`,
        req.ip,
        req.user?.id,
        { url, userAgent, body: req.body }
      );
      
      return res.status(400).json({ message: 'Request blocked due to suspicious activity' });
    }
  }

  next();
};

// Request size limiter
const requestSizeLimiter = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxBytes = parseSize(maxSize);

    if (contentLength > maxBytes) {
      logSecurityEvent(
        'large_request', 
        'medium', 
        `Large request blocked from IP: ${req.ip} (${contentLength} bytes)`,
        req.ip
      );
      
      return res.status(413).json({ message: 'Request entity too large' });
    }

    next();
  };
};

// Helper function to parse size strings
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return Math.floor(value * units[unit]);
};

// Admin session validator
const validateAdminSession = async (req, res, next) => {
  try {
    if (!req.admin) {
      return next();
    }

    // Check if admin is still active
    const pool = require('../config/database');
    const result = await pool.query(
      'SELECT is_active, last_login FROM admins WHERE id = $1',
      [req.admin.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      logSecurityEvent(
        'inactive_admin_access', 
        'high', 
        `Inactive admin attempted access: ${req.admin.id}`,
        req.ip,
        req.admin.id
      );
      
      return res.status(401).json({ message: 'Admin account is inactive' });
    }

    next();
  } catch (error) {
    console.error('Admin session validation error:', error);
    next();
  }
};

module.exports = { 
  securityHeaders, 
  ipWhitelist, 
  suspiciousActivityDetector, 
  requestSizeLimiter, 
  validateAdminSession 
};