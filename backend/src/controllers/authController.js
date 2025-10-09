const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const generateReferralCode = require('../utils/generateReferralCode');
const { generateVerificationToken, sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail, sendReferralRegisteredEmail } = require('../utils/emailService');
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

    // Create user (not verified yet)
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, phone, referral_code, referred_by, is_email_verified, email_verification_token, email_verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, full_name, referral_code',
      [email, hashedPassword, fullName, phone, referralCode, referredBy, false, otpCode, otpExpires]
    );

    const user = result.rows[0];

    // Create user profile
    await pool.query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);

    // Create wallet
    await pool.query('INSERT INTO wallets (user_id) VALUES ($1)', [user.id]);

    // Send OTP email
    console.log(`\n=== OTP SENT TO: ${email} ===`);
    console.log(`OTP Code: ${otpCode}`);
    console.log('====================================\n');
    
    try {
      await sendOTPEmail(email, otpCode, fullName);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.log('Email sending failed, but continuing registration:', emailError.message);
      // Don't fail registration if email fails
    }

    // Create referral notification (bonus will be paid when they deposit ₦18k+)
    if (referredBy) {
      const referrerResult = await pool.query('SELECT id, full_name, email FROM users WHERE referral_code = $1', [referredBy]);
      if (referrerResult.rows.length > 0) {
        // Create referral notification
        try {
          await pool.query(
            'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
            [
              referrerResult.rows[0].id,
              'New Team Member!',
              `${fullName} joined your team. You'll earn a bonus when they deposit ₦18,000+`,
              'info'
            ]
          );
        } catch (notificationError) {
          console.log('Failed to create referral notification:', notificationError.message);
        }
        
        // Send referral email
        try {
          await sendReferralRegisteredEmail(referrerResult.rows[0].email, referrerResult.rows[0].full_name, fullName);
        } catch (emailError) {
          console.log('Failed to send referral email:', emailError.message);
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
      message: 'Registration successful! Please check your email for the verification code.',
      requiresVerification: true,
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

    // Check if email is verified
    if (!user.is_email_verified) {
      return res.status(400).json({ 
        message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const jwtExpire = process.env.JWT_EXPIRE || '7d';
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: jwtExpire });

    // Check user's stage progress and create personalized notification
    try {
      const [ordersResult, teamResult] = await Promise.all([
        pool.query('SELECT COALESCE(SUM(total_amount), 0) as total_spent FROM orders WHERE user_id = $1', [user.id]),
        pool.query('SELECT COUNT(*) as team_count FROM users WHERE referred_by = $1', [user.referral_code])
      ]);
      
      const totalSpent = parseFloat(ordersResult.rows[0]?.total_spent || 0);
      const teamCount = parseInt(teamResult.rows[0]?.team_count || 0);
      
      let welcomeMessage = `Welcome back, ${user.full_name}! `;
      
      if (totalSpent < 18000) {
        const needed = 18000 - totalSpent;
        welcomeMessage += `You need ₦${needed.toLocaleString()} more to qualify for Feeder stage.`;
      } else if (teamCount < 2) {
        const needed = 2 - teamCount;
        welcomeMessage += `You're in Feeder stage! Refer ${needed} more people to reach Bronze.`;
      } else if (teamCount < 6) {
        const needed = 6 - teamCount;
        welcomeMessage += `You're in Bronze stage! Refer ${needed} more people to reach Silver.`;
      } else if (teamCount < 14) {
        const needed = 14 - teamCount;
        welcomeMessage += `You're in Silver stage! Refer ${needed} more people to reach Gold.`;
      } else if (teamCount < 30) {
        const needed = 30 - teamCount;
        welcomeMessage += `You're in Gold stage! Refer ${needed} more people to reach Diamond.`;
      } else {
        welcomeMessage += `Congratulations! You've achieved Diamond stage with ${teamCount} referrals!`;
      }
      
      await pool.query(
        'INSERT INTO market_updates (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [user.id, 'Welcome Back!', welcomeMessage, 'info']
      );
    } catch (notificationError) {
      console.log('Failed to create welcome notification:', notificationError.message);
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
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const resetToken = generateVerificationToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    await sendPasswordResetEmail(email, resetToken, user.full_name);

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { register, login, verifyEmail, resendVerification, verifyOTP, forgotPassword, resetPassword };