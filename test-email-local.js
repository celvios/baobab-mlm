require('dotenv').config();
const { sendOTPEmail, sendVerificationEmail, sendWelcomeEmail } = require('./backend/src/utils/emailService');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testEmailConfiguration() {
  console.log(`${colors.blue}🔧 Testing Email Configuration...${colors.reset}\n`);
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'SET ✓' : 'NOT SET ❌'}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`${colors.red}❌ Email credentials not configured!${colors.reset}`);
    console.log(`${colors.yellow}Please set EMAIL_USER and EMAIL_PASS in your .env file${colors.reset}\n`);
    return false;
  }
  
  return true;
}

async function testOTPEmail(email) {
  try {
    console.log(`${colors.blue}📧 Testing OTP Email...${colors.reset}`);
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOTPEmail(email, testOTP, 'Test User');
    console.log(`${colors.green}✅ OTP Email sent successfully!${colors.reset}`);
    console.log(`${colors.yellow}OTP Code: ${testOTP}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ OTP Email failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function testVerificationEmail(email) {
  try {
    console.log(`${colors.blue}📧 Testing Verification Email...${colors.reset}`);
    const testToken = 'test-verification-token-' + Date.now();
    await sendVerificationEmail(email, testToken, 'Test User');
    console.log(`${colors.green}✅ Verification Email sent successfully!${colors.reset}`);
    console.log(`${colors.yellow}Verification Token: ${testToken}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Verification Email failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function testWelcomeEmail(email) {
  try {
    console.log(`${colors.blue}📧 Testing Welcome Email...${colors.reset}`);
    const testReferralCode = 'TEST' + Math.floor(1000 + Math.random() * 9000);
    await sendWelcomeEmail(email, 'Test User', testReferralCode);
    console.log(`${colors.green}✅ Welcome Email sent successfully!${colors.reset}`);
    console.log(`${colors.yellow}Referral Code: ${testReferralCode}${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ Welcome Email failed: ${error.message}${colors.reset}\n`);
    return false;
  }
}

async function runEmailTests() {
  console.log(`${colors.blue}🚀 Baobab MLM - Email Service Test${colors.reset}\n`);
  
  // Get email from command line or use default
  const testEmail = process.argv[2] || 'your-email@gmail.com';
  
  if (testEmail === 'your-email@gmail.com') {
    console.log(`${colors.yellow}⚠️  Using default email. Run with: node test-email-local.js your-actual-email@gmail.com${colors.reset}\n`);
  }
  
  console.log(`${colors.blue}Testing with email: ${testEmail}${colors.reset}\n`);
  
  // Test configuration
  const configOk = await testEmailConfiguration();
  if (!configOk) return;
  
  let passed = 0;
  let total = 3;
  
  // Test all email types
  if (await testOTPEmail(testEmail)) passed++;
  if (await testVerificationEmail(testEmail)) passed++;
  if (await testWelcomeEmail(testEmail)) passed++;
  
  // Summary
  console.log(`${colors.blue}📊 Test Summary:${colors.reset}`);
  console.log(`Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log(`${colors.green}🎉 All email tests passed! Email service is working correctly.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Some email tests failed. Check your configuration.${colors.reset}`);
  }
  
  console.log(`\n${colors.yellow}💡 Next Steps:${colors.reset}`);
  console.log('1. Check your email inbox for test messages');
  console.log('2. Verify Gmail App Password is correct');
  console.log('3. Test the API endpoint: GET http://localhost:5000/api/test-email/your-email@gmail.com');
}

// Run tests
runEmailTests().catch(console.error);