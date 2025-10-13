const express = require('express');
const { getMatrix, getEarnings, getTeam, getLevelProgress, getFullTree, getBinaryTree, completeMatrix, getMatrixTree, syncUserMatrix, generateReferrals } = require('../controllers/mlmController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/matrix', auth, getMatrix);
router.get('/earnings', auth, getEarnings);
router.get('/team', auth, getTeam);
router.get('/tree', auth, getFullTree);
router.get('/binary-tree', auth, getBinaryTree);
router.get('/matrix-tree', auth, getMatrixTree);
router.get('/level-progress', auth, getLevelProgress);
router.post('/sync-matrix', auth, syncUserMatrix);
router.get('/complete-matrix/:email', completeMatrix);
router.post('/generate-referrals/:email', generateReferrals);

module.exports = router;