const express = require('express');
const { getMatrix, getEarnings, getTeam, getLevelProgress, getFullTree, getBinaryTree, completeMatrix, getMatrixTree, syncUserMatrix, generateReferrals, getUserIncentives } = require('../controllers/mlmController');
const { autoUpgradeStages } = require('../controllers/autoUpgradeController');
const { diagnoseBronze } = require('../controllers/diagnosticController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/matrix', auth, getMatrix);
router.get('/earnings', auth, getEarnings);
router.get('/team', auth, getTeam);
router.get('/tree', auth, getFullTree);
router.get('/binary-tree', auth, getBinaryTree);
router.get('/matrix-tree', auth, getMatrixTree);
router.get('/level-progress', auth, getLevelProgress);
router.get('/incentives', auth, getUserIncentives);
router.post('/sync-matrix', auth, syncUserMatrix);
router.get('/complete-matrix/:email', completeMatrix);
router.get('/generate-referrals/:email', generateReferrals);
router.get('/auto-upgrade', autoUpgradeStages);
router.get('/diagnose-bronze', diagnoseBronze);

module.exports = router;