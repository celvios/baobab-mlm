const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;
    
    // Simple security check
    if (secretKey !== 'BAOBAB_SETUP_2025') {
      return res.status(403).json({ message: 'Invalid secret key' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO admins (email, password, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE 
       SET password = EXCLUDED.password, updated_at = CURRENT_TIMESTAMP
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, 'super_admin', true]
    );

    res.json({ 
      message: 'Admin created successfully',
      admin: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
