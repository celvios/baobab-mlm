const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const generateReferralCode = require('../utils/generateReferralCode');
const { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, sendOTPEmail } = require('../utils/emailService');
const paystackService = require('../services/paystackService');
const mlmService = require('../services/mlmService');

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, fullName, phone, referredBy } = req.body;

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate referral code if provided
    if (referredBy) {
      const referrer = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referredBy]);
      if (referrer.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let referralCode;
    let isUnique = false;
    while (!isUnique) {
      referralCode = generateReferralCode();
      const existing = await pool.query('SELECT id FROM users WHERE referral_code = $1', [referralCode]);
      if (existing.rows.length === 0) isUnique = true;
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, phone, referral_code, referred_by, email_verification_token, email_verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, full_name, referral_code',
      [email, hashedPassword, fullName, phone, referralCode, referredBy, otpCode, otpExpires]
    );

    const user = result.rows[0];

    // Create user profile
    await pool.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);

    // Create wallet
    await pool.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);

    // Send OTP email
    console.log(`\n=== OTP FOR ${email} ===`);
    console.log(`OTP CODE: ${otpCode}`);
    console.log(`EXPIRES: ${otpExpires}`);
    console.log('========================\n');
    
    try {
      await sendOTPEmail(email, otpCode, fullName);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.log('Email sending failed, but continuing registration:', emailError.message);
      // Don't fail registration if email fails
    }

    // Process referral if referred by someone
    if (referredBy) {
      const referrerResult = await pool.query('SELECT id, full_name FROM users WHERE referral_code = $1', [referredBy]);
      if (referrerResult.rows.length > 0) {
        await mlmService.processReferral(referrerResult.rows[0].id, user.id);
        
        // Create referral notification
        try {
          await pool.query(
            'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [
              referrerResult.rows[0].id,
              'New Team Member!',
              `${fullName} joined your team using your referral code`,
              'success'
            ]
          );
        } catch (notificationError) {
          console.log('Failed to create referral notification:', notificationError.message);
        }
      }
    }

    // Create welcome notification for new user
    try {
      await pool.query(
        'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [
          user.id,
          'Welcome to Baobab!',
          'Complete your profile and make your first purchase to start earning',
          'info'
        ]
      );
    } catch (notificationError) {
      console.log('Failed to create welcome notification:', notificationError.message);
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        referralCode: user.referral_code,
        emailVerified: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Email verification check removed - users can login without verification

    // Generate JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

    // Create login notification for all users
    try {
      await pool.query(
        'INSERT INTO market_updates (user_id, title, message, type) SELECT id, $1, $2, $3 FROM users WHERE id != $4',
        [
          `User ${user.full_name} logged in`,
          `${user.full_name} is now online and active in the system`,
          'info',
          user.id
        ]
      );
    } catch (notificationError) {
      console.log('Failed to create login notification:', notificationError.message);
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        referralCode: user.referral_code,
        isActive: user.is_active,
        mlmLevel: user.mlm_level,
        emailVerified: user.is_email_verified
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with this token
    const result = await pool.query(
      'SELECT * FROM users WHERE email_verification_token = $1 AND email_verification_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = result.rows[0];

    // Update user as verified
    await pool.query(
      'UPDATE users SET is_email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
      [user.id]
    );

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name, user.referral_code);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_email_verified = false',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found or already verified' });
    }

    const user = result.rows[0];
    
    // Generate new 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update verification token with new OTP
    await pool.query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE id = $3',
      [otpCode, otpExpires, user.id]
    );

    // Send new OTP email
    await sendOTPEmail(email, otpCode, user.full_name);
    
    console.log(`Resent OTP for ${email}: ${otpCode}`);

    res.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('OTP Verification attempt:', { email, otp });

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user with this email and OTP
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND email_verification_token = $2 AND email_verification_expires > NOW()',
      [email, otp]
    );

    console.log('Database query result:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Found user:', { id: result.rows[0].id, email: result.rows[0].email, token: result.rows[0].email_verification_token });
    }

    if (result.rows.length === 0) {
      // Check if user exists but with wrong/expired OTP
      const userCheck = await pool.query('SELECT email_verification_token, email_verification_expires FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        console.log('User exists but OTP mismatch:', { 
          storedOTP: userCheck.rows[0].email_verification_token, 
          providedOTP: otp,
          expires: userCheck.rows[0].email_verification_expires 
        });
      }
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = result.rows[0];

    // Update user as verified
    await pool.query(
      'UPDATE users SET is_email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1',
      [user.id]
    );

    // Create verification success notification
    try {
      await pool.query(
        'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [
          user.id,
          'Email Verified Successfully!',
          'Your account is now verified. You can start using all features.',
          'success'
        ]
      );
    } catch (notificationError) {
      console.log('Failed to create verification notification:', notificationError.message);
    }

    // Send welcome email
    await sendWelcomeEmail(user.email, user.full_name, user.referral_code);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, verifyEmail, resendVerification, verifyOTP };