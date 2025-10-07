const nodemailer = require('nodemailer');
const crypto = require('crypto');

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('Email transporter configured with:', process.env.EMAIL_USER);
} catch (error) {
  console.error('Email transporter setup failed:', error);
}

const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const sendOTPEmail = async (email, otpCode, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Baobab Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Please use the verification code below to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h1 style="font-size: 32px; color: #4a5d23; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Verification Code</p>
        </div>
        <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, fullName, referralCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Baobab!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Your email has been verified successfully. You're now part of the Baobab community!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Referral Code: <strong>${referralCode}</strong></h3>
          <p>Share this code with friends and family to earn referral bonuses!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken, fullName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Baobab Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Password Reset Request</h2>
        <p>Hi ${fullName},</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendReferralRegisteredEmail = async (email, fullName, refereeName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'New Team Member Joined!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Great News, ${fullName}!</h2>
        <p><strong>${refereeName}</strong> just joined your team using your referral code!</p>
        <p>Keep sharing your referral code to grow your team and increase your earnings.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/user/team" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Team</a>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendEarningsEmail = async (email, fullName, amount, source) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'You Earned Money!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Congratulations, ${fullName}!</h2>
        <p>You've earned <strong>₦${amount.toLocaleString()}</strong> from ${source}!</p>
        <p>Your earnings have been credited to your wallet.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/user/wallet" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Wallet</a>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendDepositPendingEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Deposit Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Deposit Request Received</h2>
        <p>Hi ${fullName},</p>
        <p>We've received your deposit request of <strong>₦${amount.toLocaleString()}</strong>.</p>
        <p>Your request is being reviewed and will be processed shortly.</p>
        <p>You'll receive a confirmation email once your deposit is approved.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendDepositApprovedEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Deposit Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Deposit Approved!</h2>
        <p>Hi ${fullName},</p>
        <p>Great news! Your deposit of <strong>₦${amount.toLocaleString()}</strong> has been approved and credited to your wallet.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/user/wallet" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Wallet</a>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendDepositRejectedEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Deposit Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Deposit Request Rejected</h2>
        <p>Hi ${fullName},</p>
        <p>Unfortunately, your deposit request of ₦${amount.toLocaleString()} has been rejected.</p>
        <p>Please contact support for more information or submit a new request with correct payment details.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendWithdrawalPendingEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Withdrawal Request Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Withdrawal Request Received</h2>
        <p>Hi ${fullName},</p>
        <p>We've received your withdrawal request of <strong>₦${amount.toLocaleString()}</strong>.</p>
        <p>Your request is being processed and funds will be transferred to your bank account shortly.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendWithdrawalApprovedEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Withdrawal Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Withdrawal Approved!</h2>
        <p>Hi ${fullName},</p>
        <p>Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been approved!</p>
        <p>The funds will be transferred to your bank account within 24 hours.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

const sendWithdrawalRejectedEmail = async (email, fullName, amount) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Withdrawal Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Withdrawal Request Rejected</h2>
        <p>Hi ${fullName},</p>
        <p>Your withdrawal request of ₦${amount.toLocaleString()} has been rejected.</p>
        <p>The amount has been refunded to your wallet.</p>
        <p>Please contact support for more information.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationToken,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReferralRegisteredEmail,
  sendEarningsEmail,
  sendDepositPendingEmail,
  sendDepositApprovedEmail,
  sendDepositRejectedEmail,
  sendWithdrawalPendingEmail,
  sendWithdrawalApprovedEmail,
  sendWithdrawalRejectedEmail
};