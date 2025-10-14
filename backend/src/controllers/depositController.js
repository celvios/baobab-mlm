const pool = require('../config/database');
const multer = require('multer');
const path = require('path');
const { sendDepositPendingEmail } = require('../utils/emailService');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const submitDepositRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment proof image is required' });
    }

    // Convert image to base64
    const proofBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Create deposit request
    const result = await pool.query(`
      INSERT INTO deposit_requests (user_id, amount, payment_proof, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [userId, parseFloat(amount), proofBase64, 'pending']);

    // Send email notification
    try {
      const userResult = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0) {
        await sendDepositPendingEmail(userResult.rows[0].email, userResult.rows[0].full_name, parseFloat(amount));
      }
    } catch (emailError) {
      console.log('Failed to send deposit email:', emailError.message);
    }

    res.json({
      message: 'Deposit request submitted successfully',
      depositId: result.rows[0].id
    });
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getDepositStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT dr.*, u.dashboard_unlocked, u.deposit_confirmed, u.mlm_level
       FROM deposit_requests dr
       JOIN users u ON u.id = dr.user_id
       WHERE dr.user_id = $1
       ORDER BY dr.created_at DESC
       LIMIT 1`,
      [userId]
    );
    
    res.json({
      deposit: result.rows[0] || null,
      dashboardUnlocked: result.rows[0]?.dashboard_unlocked || false
    });
  } catch (error) {
    console.error('Error getting deposit status:', error);
    res.status(500).json({ error: 'Failed to get deposit status' });
  }
};

module.exports = { submitDepositRequest, getDepositStatus, upload };