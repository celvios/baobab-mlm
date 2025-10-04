const express = require('express');
const { getMatrix, getEarnings, getTeam, getLevelProgress } = require('../controllers/mlmController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/matrix', auth, getMatrix);
router.get('/earnings', auth, getEarnings);
router.get('/team', auth, getTeam);
router.get('/level-progress', auth, getLevelProgress);

module.exports = router;