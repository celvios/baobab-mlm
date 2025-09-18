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

    // Create deposit request
    await pool.query(
      'INSERT INTO deposit_requests (user_id, amount, proof_url, status) VALUES ($1, $2, $3, $4)',
      [userId, amount, proofUrl, 'pending']
    );

    res.json({ message: 'Deposit request submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const { requestId, userId, amount } = req.body;
    const adminId = req.admin.id;

    // Credit user wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + $1 WHERE user_id = $2',
      [amount, userId]
    );

    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'credit', amount, 'Wallet deposit approved by admin', 'completed']
    );

    // Update deposit request status
    await pool.query(
      'UPDATE deposit_requests SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['approved', adminId, requestId]
    );

    res.json({ message: 'Deposit approved and wallet credited' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepositRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        dr.id, dr.user_id, dr.amount, dr.proof_url, dr.created_at,
        u.full_name, u.email
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      WHERE dr.status = 'pending'
      ORDER BY dr.created_at DESC
    `);

    res.json({ depositRequests: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  uploadPaymentProof: [upload.single('paymentProof'), uploadPaymentProof],
  approveDeposit,
  getDepositRequests
};