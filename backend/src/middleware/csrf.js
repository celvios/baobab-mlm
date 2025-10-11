const crypto = require('crypto');

const csrfTokens = new Map();

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const csrfProtection = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.headers['authorization'];

  if (!token || !sessionId) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== token) {
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateCsrfToken = (req, res, next) => {
  const sessionId = req.headers['authorization'] || req.ip;
  const token = generateToken();
  csrfTokens.set(sessionId, token);
  
  setTimeout(() => csrfTokens.delete(sessionId), 3600000);
  
  res.locals.csrfToken = token;
  next();
};

module.exports = { csrfProtection, generateCsrfToken };
