const pool = require('../config/database');

const checkDashboardAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT dashboard_unlocked, deposit_confirmed FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    if (!user.dashboard_unlocked || !user.deposit_confirmed) {
      return res.status(403).json({ 
        error: 'Dashboard locked',
        message: 'Please deposit $18,000 to unlock dashboard features',
        dashboardLocked: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Dashboard access check error:', error);
    res.status(500).json({ error: 'Failed to verify dashboard access' });
  }
};

module.exports = checkDashboardAccess;
