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
    const { depositId, amount } = req.body;
    const adminId = req.admin.id;

    // Get deposit request details
    const depositResult = await pool.query('SELECT * FROM deposit_requests WHERE id = $1', [depositId]);
    if (depositResult.rows.length === 0) {
      return res.status(404).json({ message: 'Deposit request not found' });
    }

    const deposit = depositResult.rows[0];
    const userId = deposit.user_id;
    const depositAmount = amount || deposit.amount;

    // Ensure wallet exists
    await pool.query(
      'INSERT INTO wallets (user_id, balance) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING',
      [userId]
    );

    // Credit user wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [depositAmount, userId]
    );

    // Create transaction record
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description, status, admin_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'credit', depositAmount, 'Deposit approved by admin', 'completed', adminId]
    );

    // Update deposit request status
    await pool.query(
      'UPDATE deposit_requests SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['approved', adminId, depositId]
    );

    res.json({ message: 'Deposit approved and wallet credited successfully' });
  } catch (error) {
    console.error('Approve deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getDepositRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        dr.id, dr.user_id, dr.amount, dr.proof_url, dr.status, dr.created_at,
        u.full_name as user_name, u.email as user_email
      FROM deposit_requests dr
      JOIN users u ON dr.user_id = u.id
      ORDER BY dr.created_at DESC
    `);

    res.json({ deposits: result.rows });
  } catch (error) {
    console.error('Get deposit requests error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const { depositId } = req.body;
    const adminId = req.admin.id;

    // Update deposit request status to rejected
    await pool.query(
      'UPDATE deposit_requests SET status = $1, rejected_by = $2, rejected_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['rejected', adminId, depositId]
    );

    res.json({ message: 'Deposit request rejected successfully' });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { 
  uploadPaymentProof: [upload.single('paymentProof'), uploadPaymentProof],
  approveDeposit,
  rejectDeposit,
  getDepositRequests
};