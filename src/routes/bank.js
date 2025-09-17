const express = require('express');
const router = express.Router();
const paystackService = require('../services/paystackService');
const auth = require('../middleware/auth');

// Verify bank account
router.post('/verify-account', auth, async (req, res) => {
  try {
    const { accountNumber, bankCode } = req.body;

    if (!accountNumber || !bankCode) {
      return res.status(400).json({
        success: false,
        message: 'Account number and bank code are required'
      });
    }

    const result = await paystackService.verifyBankAccount(accountNumber, bankCode);
    res.json(result);
  } catch (error) {
    console.error('Bank verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account verification'
    });
  }
});

// Get list of banks
router.get('/banks', auth, async (req, res) => {
  try {
    const banks = await paystackService.getBanks();
    res.json({
      success: true,
      data: banks
    });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching banks'
    });
  }
});

module.exports = router;