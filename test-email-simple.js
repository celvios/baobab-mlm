// Simple email test for Render deployment
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail(recipientEmail) {
  console.log('Testing email configuration...');
  
  // Check environment variables
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Missing');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Missing');
  
  if (process.env.SENDGRID_API_KEY) {
    // Test SendGrid
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: recipientEmail,
        from: process.env.SENDGRID_FROM_EMAIL || 'test@baobabmlm.com',
        subject: 'Baobab Email Test',
        html: '<h2>Email test successful!</h2><p>SendGrid is working on Render.</p>'
      };
      
      await sgMail.send(msg);
      console.log('✅ SendGrid email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ SendGrid error:', error.message);
      console.error('Error code:', error.code);
    }
  }
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Test Gmail
    try {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: 'Baobab Email Test - Gmail',
        html: '<h2>Gmail test successful!</h2><p>Gmail backup is working.</p>'
      });
      
      console.log('✅ Gmail email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Gmail error:', error.message);
    }
  }
  
  console.log('❌ No working email service found');
  return false;
}

// Run test
const email = process.argv[2] || 'test@example.com';
testEmail(email).then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});