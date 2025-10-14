const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if admin exists and is active
    const result = await pool.query(
      'SELECT id, email, name, role FROM admins WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = result.rows[0];
    req.admin = result.rows[0];
    next();
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = adminAuth;