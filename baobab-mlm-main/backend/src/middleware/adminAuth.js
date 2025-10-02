const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user is admin
    const result = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1 AND role = $2',
      [decoded.userId, 'admin']
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = adminAuth;