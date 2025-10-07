# Baobab MLM Email System Documentation

## Overview
Comprehensive email notification system implemented for all user actions and admin operations.

## Email Templates Implemented

### 1. **OTP Verification Email** ✅
- **Trigger**: User registration
- **Function**: `sendOTPEmail(email, otpCode, fullName)`
- **Content**: 6-digit OTP code for email verification
- **Expiry**: 10 minutes

### 2. **Resend OTP Email** ✅
- **Trigger**: User requests resend verification code
- **Endpoint**: `POST /api/auth/resend-verification`
- **Function**: `sendOTPEmail(email, otpCode, fullName)`
- **Status**: Working - generates new OTP and sends email

### 3. **Welcome Email** ✅
- **Trigger**: Email verification successful
- **Function**: `sendWelcomeEmail(email, fullName, referralCode)`
- **Content**: Welcome message, referral code, next steps, dashboard link

### 4. **Forgot Password Email** ✅
- **Trigger**: User requests password reset
- **Endpoint**: `POST /api/auth/forgot-password`
- **Function**: `sendPasswordResetEmail(email, resetToken, fullName)`
- **Content**: Password reset link (expires in 1 hour)
- **Reset URL**: `{FRONTEND_URL}/reset-password?token={resetToken}`

### 5. **Referral Registered Email** ✅
- **Trigger**: Someone registers using user's referral code
- **Function**: `sendReferralRegisteredEmail(email, fullName, refereeName)`
- **Content**: Notification that new team member joined, link to team page

### 6. **Earnings Email** ✅
- **Trigger**: User earns money from referrals/MLM
- **Function**: `sendEarningsEmail(email, fullName, amount, source)`
- **Content**: Earnings amount, source, link to wallet
- **Note**: Ready to use when MLM earnings are processed

### 7. **Deposit Request Pending Email** ✅
- **Trigger**: User submits deposit request
- **Function**: `sendDepositPendingEmail(email, fullName, amount)`
- **Content**: Confirmation that deposit request is received and being reviewed

### 8. **Deposit Approved Email** ✅
- **Trigger**: Admin approves deposit request
- **Endpoint**: `POST /api/admin/approve-deposit`
- **Function**: `sendDepositApprovedEmail(email, fullName, amount)`
- **Content**: Deposit approved, amount credited, link to wallet

### 9. **Deposit Rejected Email** ✅
- **Trigger**: Admin rejects deposit request
- **Endpoint**: `POST /api/admin/reject-deposit`
- **Function**: `sendDepositRejectedEmail(email, fullName, amount)`
- **Content**: Deposit rejected, contact support message

### 10. **Withdrawal Request Pending Email** ✅
- **Trigger**: User submits withdrawal request
- **Function**: `sendWithdrawalPendingEmail(email, fullName, amount)`
- **Content**: Confirmation that withdrawal request is received and being processed

### 11. **Withdrawal Approved Email** ✅
- **Trigger**: Admin approves withdrawal request
- **Endpoint**: `PUT /api/admin/withdrawals/:id`
- **Function**: `sendWithdrawalApprovedEmail(email, fullName, amount)`
- **Content**: Withdrawal approved, funds will be transferred within 24 hours

### 12. **Withdrawal Rejected Email** ✅
- **Trigger**: Admin rejects withdrawal request
- **Endpoint**: `PUT /api/admin/withdrawals/:id`
- **Function**: `sendWithdrawalRejectedEmail(email, fullName, amount)`
- **Content**: Withdrawal rejected, amount refunded to wallet, contact support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Sends OTP email
- `POST /api/auth/resend-verification` - Resends OTP email
- `POST /api/auth/verify-otp` - Verifies OTP and sends welcome email
- `POST /api/auth/forgot-password` - Sends password reset email
- `POST /api/auth/reset-password` - Resets password (no email)

### Deposits
- `POST /api/deposit/request` - Sends deposit pending email
- `POST /api/admin/approve-deposit` - Sends deposit approved email
- `POST /api/admin/reject-deposit` - Sends deposit rejected email

### Withdrawals
- `POST /api/withdrawal/request` - Sends withdrawal pending email
- `PUT /api/admin/withdrawals/:id` - Sends approval/rejection email

## Database Setup Required

Run this endpoint to add password reset columns:
```
GET /api/admin/add-password-reset-columns
```

This adds:
- `password_reset_token` VARCHAR(255)
- `password_reset_expires` TIMESTAMP

## Email Configuration

Required environment variables:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://baobab-frontend.vercel.app
```

## Frontend Integration Needed

### 1. Password Reset Flow
Create a reset password page at `/reset-password` that:
- Reads token from URL query parameter
- Shows a form to enter new password
- Calls `POST /api/auth/reset-password` with token and newPassword

### 2. Forgot Password Link
Add "Forgot Password?" link on login page that:
- Opens a modal or navigates to forgot password page
- Collects user email
- Calls `POST /api/auth/forgot-password`

## Testing

All emails are sent asynchronously and failures are logged but don't block operations. To test:

1. **OTP Email**: Register a new user
2. **Resend OTP**: Call resend verification endpoint
3. **Welcome Email**: Verify OTP
4. **Forgot Password**: Call forgot password endpoint
5. **Deposit Emails**: Submit and approve/reject deposit
6. **Withdrawal Emails**: Submit and approve/reject withdrawal
7. **Referral Email**: Register with someone's referral code

## Notes

- All emails use Gmail SMTP service
- Email failures are logged but don't stop operations
- All email templates use Baobab brand color (#4a5d23)
- Links point to production frontend URL
- All amounts are formatted with Nigerian Naira symbol (₦)
