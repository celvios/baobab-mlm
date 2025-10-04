# OTP System - Temporary Disable Instructions

## Current Status: DISABLED ⚠️

The OTP (One-Time Password) email verification system has been temporarily disabled to allow easier user registration and login during development/testing.

## What Changed

### Backend Changes (`backend/src/controllers/authController.js`)
- **Registration**: Users are automatically verified (`is_email_verified = true`) upon registration
- **Login**: Email verification check is bypassed
- **Email**: Welcome email is sent directly instead of OTP email

### Frontend Changes
- **Register.js**: Redirects to login page instead of verification page
- **Login.js**: Removed verification redirect logic
- **SecurityVerification.js**: Still exists but not used in current flow

## How to Re-enable OTP System

### Step 1: Update Backend Controller
In `backend/src/controllers/authController.js`:

1. **Registration function** - Uncomment OTP generation and restore original database insert:
```javascript
// Restore this:
const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

const result = await pool.query(
  'INSERT INTO users (email, password, full_name, phone, referral_code, referred_by, email_verification_token, email_verification_expires) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, full_name, referral_code',
  [email, hashedPassword, fullName, phone, referralCode, referredBy, otpCode, otpExpires]
);
```

2. **Registration function** - Restore OTP email sending:
```javascript
// Restore this:
await sendOTPEmail(email, otpCode, fullName);
```

3. **Registration response** - Change message and emailVerified status:
```javascript
res.status(201).json({
  message: 'User registered successfully. Please check your email to verify your account.',
  user: {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    referralCode: user.referral_code,
    emailVerified: false
  }
});
```

4. **Login function** - Restore email verification check:
```javascript
// Restore this:
if (!user.is_email_verified) {
  return res.status(400).json({ 
    message: 'Please verify your email before logging in. Check your inbox for the verification code.',
    requiresVerification: true,
    email: user.email
  });
}
```

### Step 2: Update Frontend Files

1. **Register.js** - Restore verification page redirect:
```javascript
// Restore this:
localStorage.setItem('pendingVerificationEmail', formData.email);
addNotification('Registration successful! Please check your email for the verification code.', 'success');
setTimeout(() => {
  window.location.href = '/security-verification';
}, 2000);
```

2. **Login.js** - Restore verification redirect logic:
```javascript
// Restore this:
} catch (error) {
  if (error.message.includes('verify your email')) {
    addNotification('Please verify your email first. Redirecting to verification page...', 'warning');
    setTimeout(() => {
      navigate('/security-verification');
    }, 2000);
  } else {
    addNotification(error.message || 'Login failed. Please check your credentials.', 'error');
  }
}
```

### Step 3: Ensure Email Service is Working

Make sure your email configuration is properly set up in your environment variables:
- `EMAIL_USER` and `EMAIL_PASS` (for Gmail)
- OR `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` (for SendGrid)

### Step 4: Test the Flow

1. Register a new user
2. Check email for OTP code
3. Use SecurityVerification page to verify
4. Login should work after verification

## Files Modified for Temporary Disable

- `backend/src/controllers/authController.js`
- `src/controllers/authController.js` (frontend copy)
- `src/pages/Register.js`
- `src/pages/Login.js`

## Files NOT Modified (Still Work When Re-enabled)

- `src/pages/SecurityVerification.js` - OTP verification page
- `backend/utils/emailService.js` - Email sending functions
- `backend/utils/emailTemplates.js` - Email templates

## Quick Toggle Method

For easier management, you can use the configuration file:
`backend/src/config/otpConfig.js`

Set `OTP_ENABLED: true` and update the auth controller to use this config.