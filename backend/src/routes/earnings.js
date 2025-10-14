const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserEarnings, getStageProgress } = require('../controllers/earningsController');

router.get('/', auth, getUserEarnings);
router.get('/progress', auth, getStageProgress);

module.exports = router;
