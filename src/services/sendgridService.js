const sgMail = require('@sendgrid/mail');

class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@baobab.com';
  }

  async sendEmail(to, subject, html, text = '') {
    const msg = {
      to,
      from: {
        email: this.fromEmail,
        name: 'Baobab MLM'
      },
      subject,
      text: text || subject,
      html
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully to:', to);
      return { success: true };
    } catch (error) {
      console.error('SendGrid error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Baobab MLM!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
      </div>
    `;
    
    return await this.sendEmail(email, 'Verify Your Email - Baobab MLM', html);
  }

  async sendOTPEmail(email, otp) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <p>Your OTP code is:</p>
        <h1 style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;
    
    return await this.sendEmail(email, 'Your Verification Code - Baobab MLM', html);
  }
}

module.exports = new SendGridService();