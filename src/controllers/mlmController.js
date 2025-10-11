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

module.exports = { getMatrix, getEarnings, getTeam, getLevelProgress };