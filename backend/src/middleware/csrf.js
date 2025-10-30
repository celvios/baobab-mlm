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
  const sessionId = req.headers['authorization'] || req.ip;

  if (!token) {
    console.log('CSRF token missing for session:', sessionId);
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== token) {
    console.log('CSRF token mismatch:', { sessionId, provided: token, stored: storedToken, allTokens: Array.from(csrfTokens.keys()) });
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }

  next();
};

const generateCsrfToken = (req, res, next) => {
  const sessionId = req.headers['authorization'] || req.ip;
  const token = generateToken();
  csrfTokens.set(sessionId, token);
  
  console.log('Generated CSRF token for session:', sessionId);
  
  setTimeout(() => csrfTokens.delete(sessionId), 3600000);
  
  res.cookie('XSRF-TOKEN', token, { 
    httpOnly: false, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 3600000 
  });
  res.locals.csrfToken = token;
  next();
};

module.exports = { csrfProtection, generateCsrfToken };
