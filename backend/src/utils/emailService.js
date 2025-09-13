const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, token, fullName) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Baobab Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Thank you for joining the Baobab community. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, fullName, referralCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Baobab - Your Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Your email has been verified successfully. You're now part of the Baobab community!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Referral Code: <strong>${referralCode}</strong></h3>
          <p>Share this code with friends and family to earn referral bonuses!</p>
        </div>
        <h3>Next Steps:</h3>
        <ol>
          <li>Complete your profile with bank details</li>
          <li>Purchase products worth ₦9,000</li>
          <li>Pay registration fee of ₦9,000</li>
          <li>Start earning with our MLM system!</li>
        </ol>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otpCode, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Baobab Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Thank you for joining the Baobab community. Please use the verification code below to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h1 style="font-size: 32px; color: #4a5d23; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Verification Code</p>
        </div>
        <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateVerificationToken, sendVerificationEmail, sendWelcomeEmail, sendOTPEmail };