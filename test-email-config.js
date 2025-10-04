// Simple email configuration test for Render
const express = require('express');
const app = express();

// Test endpoint to check email configuration
app.get('/api/check-email-config', (req, res) => {
  const emailConfig = {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
  
  res.json({
    message: 'Email Configuration Check',
    config: emailConfig,
    timestamp: new Date().toISOString()
  });
});

// Test OTP email with detailed error logging
app.get('/api/test-otp/:email', async (req, res) => {
  try {
    console.log('Testing OTP email for:', req.params.email);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        error: 'Email configuration missing',
        details: {
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'NOT SET'
        }
      });
    }
    
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.params.email,
      subject: 'Baobab MLM - Test OTP',
      html: `
        <h2>Test OTP Verification</h2>
        <p>Your test OTP code is: <strong>${testOTP}</strong></p>
        <p>This is a test email from your Render server.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({
      success: true,
      message: `Test OTP sent successfully to ${req.params.email}`,
      otp: testOTP,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Email test server running on port ${PORT}`);
});