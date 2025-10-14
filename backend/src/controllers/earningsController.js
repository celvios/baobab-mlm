const earningsService = require('../services/earningsService');

const getUserEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [total, byStage, progress] = await Promise.all([
      earningsService.calculateUserEarnings(userId),
      earningsService.getEarningsByStage(userId),
      earningsService.getStageProgress(userId)
    ]);
    
    res.json({
      totalEarnings: total,
      earningsByStage: byStage,
      currentStageProgress: progress
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

const getStageProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await earningsService.getStageProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching stage progress:', error);
    res.status(500).json({ error: 'Failed to fetch stage progress' });
  }
};

module.exports = { getUserEarnings, getStageProgress };
