require('dotenv').config();
const { sendOTPEmail } = require('./src/utils/emailService');

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    // Test with your email
    await sendOTPEmail('your-test-email@gmail.com', '123456', 'Test User');
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();