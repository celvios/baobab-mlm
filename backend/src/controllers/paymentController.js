const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const mlmService = require('../services/mlmService');

// Configure multer for payment proof uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

const uploadPaymentProof = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    // Convert image to base64
    const proofUrl = req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null;

    // Check if this is a joining fee or deposit
    const userResult = await pool.query('SELECT joining_fee_paid FROM users WHERE id = $1', [userId]);
    const isJoiningFee = !userResult.rows[0]?.joining_fee_paid;

    if (isJoiningFee) {
      // Create payment confirmation record for joining fee
      await pool.query(
        'INSERT INTO payment_confirmations (user_id, amount, proof_url, type) VALUES ($1, $2, $3, $4)',
        [userId, amount, proofUrl, 'joining_fee']
      );

      // Update user payment proof
      await pool.query(
        'UPDATE users SET payment_proof_url = $1, joining_fee_amount = $2 WHERE id = $3',
        [proofUrl, amount, userId]
      );
    } else {
      // Create deposit request
      await pool.query(
        'INSERT INTO payment_confirmations (user_id, amount, proof_url, type) VALUES ($1, $2, $3, $4)',
        [userId, amount, proofUrl, 'deposit']
      );
    }

    res.json({ message: 'Payment proof uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.admin.id;
    const { creditAmount, type = 'joining_fee' } = req.body;

    if (type === 'joining_fee') {
      // Update user as paid
      await pool.query(
        'UPDATE users SET joining_fee_paid = true, mlm_level = $1, payment_confirmed_by = $2, payment_confirmed_at = CURRENT_TIMESTAMP WHERE id = $3',
        ['feeder', adminId, userId]
      );
      
      // Initialize MLM for user
      await mlmService.initializeUser(userId);
      
      // Get referrer and place in matrix
      const userResult = await pool.query('SELECT referred_by FROM users WHERE id = $1', [userId]);
      if (userResult.rows[0]?.referred_by) {
        const referrerResult = await pool.query('SELECT id FROM users WHERE referral_code = $1', [userResult.rows[0].referred_by]);
        if (referrerResult.rows.length > 0) {
          await mlmService.placeUserInMatrix(userId, referrerResult.rows[0].id);
        }
      }
    }

    // Credit user wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [creditAmount, userId]
    );

    // Create transaction record
    const description = type === 'joining_fee' ? 'Joining fee payment confirmed' : 'Wallet deposit confirmed';
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, 'credit', creditAmount, description]
    );

    // Update payment confirmation status
    await pool.query(
      'UPDATE payment_confirmations SET status = $1, confirmed_by = $2, confirmed_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND status = $4 AND type = $5',
      ['confirmed', adminId, userId, 'pending', type]
    );

    res.json({ message: 'Payment confirmed and wallet credited' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        pc.id, pc.user_id, pc.amount, pc.proof_url, pc.type, pc.created_at,
        u.full_name, u.email
      FROM payment_confirmations pc
      JOIN users u ON pc.user_id = u.id
      WHERE pc.status = 'pending'
      ORDER BY pc.created_at DESC
    `);

    res.json({ pendingPayments: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  uploadPaymentProof: [upload.single('paymentProof'), uploadPaymentProof],
  confirmPayment,
  getPendingPayments
};