const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@baobab.com';

console.log('SendGrid configured:', {
  apiKey: process.env.SENDGRID_API_KEY ? 'SET' : 'NOT SET',
  fromEmail: FROM_EMAIL
});

const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to: to,
      from: FROM_EMAIL,
      subject: subject,
      html: html
    };
    
    const result = await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.response?.body || error);
    throw error;
  }
};

const sendOTPEmail = async (email, otpCode, fullName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
      <p>Please use the verification code below to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
        <h1 style="font-size: 32px; color: #4a5d23; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
        <p style="margin: 10px 0 0 0; color: #666;">Verification Code</p>
      </div>
      <p><strong>Important:</strong> This code will expire in 10 minutes.</p>
    </div>
  `;
  await sendEmail(email, 'Your Baobab Verification Code', html);
};

const sendWelcomeEmail = async (email, fullName, referralCode) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
      <p>Your email has been verified successfully. You're now part of the Baobab community!</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Referral Code: <strong>${referralCode}</strong></h3>
        <p>Share this code with friends and family to earn referral bonuses!</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/user/dashboard" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
      </div>
    </div>
  `;
  await sendEmail(email, 'Welcome to Baobab!', html);
};

const sendPasswordResetEmail = async (email, resetToken, fullName) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const html = `
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
  `;
  await sendEmail(email, 'Reset Your Baobab Password', html);
};

const sendReferralRegisteredEmail = async (email, fullName, refereeName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Great News, ${fullName}!</h2>
      <p><strong>${refereeName}</strong> just joined your team using your referral code!</p>
      <p>Keep sharing your referral code to grow your team and increase your earnings.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/user/team" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Team</a>
      </div>
    </div>
  `;
  await sendEmail(email, 'New Team Member Joined!', html);
};

const sendEarningsEmail = async (email, fullName, amount, source) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Congratulations, ${fullName}!</h2>
      <p>You've earned <strong>₦${amount.toLocaleString()}</strong> from ${source}!</p>
      <p>Your earnings have been credited to your wallet.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/user/wallet" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(email, 'You Earned Money!', html);
};

const sendDepositPendingEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Deposit Request Received</h2>
      <p>Hi ${fullName},</p>
      <p>We've received your deposit request of <strong>₦${amount.toLocaleString()}</strong>.</p>
      <p>Your request is being reviewed and will be processed shortly.</p>
      <p>You'll receive a confirmation email once your deposit is approved.</p>
    </div>
  `;
  await sendEmail(email, 'Deposit Request Received', html);
};

const sendDepositApprovedEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Deposit Approved!</h2>
      <p>Hi ${fullName},</p>
      <p>Great news! Your deposit of <strong>₦${amount.toLocaleString()}</strong> has been approved and credited to your wallet.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/user/wallet" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Wallet</a>
      </div>
    </div>
  `;
  await sendEmail(email, 'Deposit Approved!', html);
};

const sendDepositRejectedEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Deposit Request Rejected</h2>
      <p>Hi ${fullName},</p>
      <p>Unfortunately, your deposit request of ₦${amount.toLocaleString()} has been rejected.</p>
      <p>Please contact support for more information or submit a new request with correct payment details.</p>
    </div>
  `;
  await sendEmail(email, 'Deposit Request Rejected', html);
};

const sendWithdrawalPendingEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Withdrawal Request Received</h2>
      <p>Hi ${fullName},</p>
      <p>We've received your withdrawal request of <strong>₦${amount.toLocaleString()}</strong>.</p>
      <p>Your request is being processed and funds will be transferred to your bank account shortly.</p>
    </div>
  `;
  await sendEmail(email, 'Withdrawal Request Received', html);
};

const sendWithdrawalApprovedEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5d23;">Withdrawal Approved!</h2>
      <p>Hi ${fullName},</p>
      <p>Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been approved!</p>
      <p>The funds will be transferred to your bank account within 24 hours.</p>
    </div>
  `;
  await sendEmail(email, 'Withdrawal Approved!', html);
};

const sendWithdrawalRejectedEmail = async (email, fullName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">Withdrawal Request Rejected</h2>
      <p>Hi ${fullName},</p>
      <p>Your withdrawal request of ₦${amount.toLocaleString()} has been rejected.</p>
      <p>The amount has been refunded to your wallet.</p>
      <p>Please contact support for more information.</p>
    </div>
  `;
  await sendEmail(email, 'Withdrawal Request Rejected', html);
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