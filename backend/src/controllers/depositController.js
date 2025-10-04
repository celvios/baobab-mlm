const pool = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const path = require('path');
    const uploadDir = path.join(__dirname, '../../uploads/deposit-proofs/');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'deposit-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
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

    // Create deposit request
    const result = await pool.query(`
      INSERT INTO deposit_requests (user_id, amount, payment_proof, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [userId, parseFloat(amount), req.file.filename, 'pending']);

    res.json({
      message: 'Deposit request submitted successfully',
      depositId: result.rows[0].id
    });
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { submitDepositRequest, upload };