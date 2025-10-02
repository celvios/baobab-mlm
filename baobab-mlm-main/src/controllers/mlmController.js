const mlmService = require('../services/mlmService');
const pool = require('../config/database');

const getMatrix = async (req, res) => {
  try {
    const userId = req.user.id;
    const matrix = await mlmService.getUserMatrix(userId);
    res.json({ matrix });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const earnings = await mlmService.getUserEarnings(userId);
    res.json({ earnings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const team = await mlmService.getTeamMembers(userId);
    res.json({ team });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getLevelProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current user level and referral count
    const userResult = await pool.query(`
      SELECT u.mlm_level, COUNT(r.id) as referral_count
      FROM users u
      LEFT JOIN users r ON r.referred_by = u.referral_code
      WHERE u.id = $1
      GROUP BY u.id, u.mlm_level
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { mlm_level, referral_count } = userResult.rows[0];
    
    const levelRequirements = {
      feeder: { next: 'bronze', required: 6 },
      bronze: { next: 'silver', required: 20 },
      silver: { next: 'gold', required: 34 },
      gold: { next: 'diamond', required: 48 },
      diamond: { next: 'infinity', required: 62 },
      infinity: { next: null, required: 0 }
    };

    const current = levelRequirements[mlm_level];
    const progress = current.next ? Math.min((parseInt(referral_count) / current.required) * 100, 100) : 100;

    res.json({
      currentLevel: mlm_level,
      nextLevel: current.next,
      currentReferrals: parseInt(referral_count),
      requiredReferrals: current.required,
      progress: Math.round(progress)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMatrix, getEarnings, getTeam, getLevelProgress };