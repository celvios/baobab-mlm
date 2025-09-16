const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-proofs/');
  },
  filename: (req, file, cb) => {
    cb(null, `payment-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
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
    const proofUrl = req.file ? `/uploads/payment-proofs/${req.file.filename}` : null;

    // Create payment confirmation record
    await pool.query(
      'INSERT INTO payment_confirmations (user_id, amount, proof_url) VALUES ($1, $2, $3)',
      [userId, amount, proofUrl]
    );

    // Update user payment proof
    await pool.query(
      'UPDATE users SET payment_proof_url = $1, joining_fee_amount = $2 WHERE id = $3',
      [proofUrl, amount, userId]
    );

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
    const { creditAmount } = req.body;

    // Update user as paid
    await pool.query(
      'UPDATE users SET joining_fee_paid = true, payment_confirmed_by = $1, payment_confirmed_at = CURRENT_TIMESTAMP WHERE id = $2',
      [adminId, userId]
    );

    // Credit user wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + $1, total_earned = total_earned + $1 WHERE user_id = $2',
      [creditAmount, userId]
    );

    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, 'credit', creditAmount, 'Joining fee payment confirmed']
    );

    // Update payment confirmation status
    await pool.query(
      'UPDATE payment_confirmations SET status = $1, confirmed_by = $2, confirmed_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND status = $4',
      ['confirmed', adminId, userId, 'pending']
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
        u.id, u.full_name, u.email, u.joining_fee_amount, u.payment_proof_url,
        pc.created_at as payment_submitted_at
      FROM users u
      LEFT JOIN payment_confirmations pc ON u.id = pc.user_id AND pc.status = 'pending'
      WHERE u.joining_fee_paid = false AND u.payment_proof_url IS NOT NULL
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