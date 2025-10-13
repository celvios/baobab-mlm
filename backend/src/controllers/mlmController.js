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

const getBinaryTree = async (req, res) => {
  try {
    const userId = req.user.id;
    const tree = await mlmService.getBinaryTree(userId);
    res.json({ tree });
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
    const progress = await mlmService.getStageProgress(userId);
    
    if (!progress) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFullTree = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level, referral_code, referred_by FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    let referrer = null;
    
    if (user.referred_by) {
      const referrerResult = await pool.query(
        'SELECT id, full_name, email, mlm_level, referral_code FROM users WHERE referral_code = $1',
        [user.referred_by]
      );
      
      if (referrerResult.rows.length > 0) {
        referrer = referrerResult.rows[0];
      }
    }
    
    const team = await mlmService.getTeamMembers(userId);
    
    res.json({ 
      user: {
        ...user,
        team
      },
      referrer
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const completeMatrix = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userResult = await pool.query(
      'SELECT id, full_name, email, mlm_level, referral_code FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];
    const result = await mlmService.completeUserMatrix(user.id, user.mlm_level);
    
    res.json({
      message: 'Matrix completion process executed',
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        currentStage: user.mlm_level
      },
      result
    });
  } catch (error) {
    console.error('Complete matrix error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMatrix, getEarnings, getTeam, getLevelProgress, getFullTree, getBinaryTree, completeMatrix };