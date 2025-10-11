const express = require('express');
const { getMatrix, getEarnings, getTeam, getLevelProgress, getFullTree, getBinaryTree } = require('../controllers/mlmController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/matrix', auth, getMatrix);
router.get('/earnings', auth, getEarnings);
router.get('/team', auth, getTeam);
router.get('/tree', auth, getFullTree);
router.get('/binary-tree', auth, getBinaryTree);
router.get('/level-progress', auth, getLevelProgress);

module.exports = router;