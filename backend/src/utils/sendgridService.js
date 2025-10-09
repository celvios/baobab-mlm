const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, otpCode, fullName) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@baobabmlm.com',
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

  try {
    await sgMail.send(msg);
    console.log(`OTP email sent successfully to ${email} via SendGrid`);
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
};

const sendVerificationEmail = async (email, token, fullName) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@baobabmlm.com',
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
      </div>
    `
  };

  await sgMail.send(msg);
};

const sendWelcomeEmail = async (email, fullName, referralCode) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@baobabmlm.com',
    subject: 'Welcome to Baobab - Your Journey Begins!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5d23;">Welcome to Baobab, ${fullName}!</h2>
        <p>Your email has been verified successfully. You're now part of the Baobab community!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Referral Code: <strong>${referralCode}</strong></h3>
          <p>Share this code with friends and family to earn referral bonuses!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/user/dashboard" style="background-color: #4a5d23; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      </div>
    `
  };

  await sgMail.send(msg);
};

module.exports = { sendOTPEmail, sendVerificationEmail, sendWelcomeEmail };