# SendGrid Email Service Setup Guide

## ✅ What's Been Done

- Removed Mailgun completely
- Installed @sendgrid/mail package
- Updated all email functions to use SendGrid
- No domain required for testing!

## 🚀 SendGrid Setup Steps (5 Minutes)

### 1. Create SendGrid Account
1. Go to [https://signup.sendgrid.com/](https://signup.sendgrid.com/)
2. Sign up for FREE account (100 emails/day forever)
3. Verify your email address
4. Complete account setup

### 2. Create API Key
1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: "Baobab MLM"
5. Select **Full Access**
6. Click **Create & View**
7. **COPY THE KEY** (you won't see it again!)

### 3. Verify Sender Identity
Since you don't have a domain yet:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in the form:
   - From Name: `Baobab MLM`
   - From Email: Your email (e.g., `toluking001@gmail.com`)
   - Reply To: Same email
   - Company Address: Your address
4. Click **Create**
5. Check your email and verify

### 4. Configure Environment Variables

Add these to your Render backend:

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=toluking001@gmail.com
FRONTEND_URL=https://baobab-frontend.vercel.app
```

**Important:** Use the EXACT email you verified in step 3 as FROM_EMAIL

## 📧 Email Functions Available

All 12 email types work with SendGrid:

1. OTP verification emails
2. Welcome emails
3. Password reset emails
4. Referral registration emails
5. Earnings notifications
6. Deposit pending/approved/rejected
7. Withdrawal pending/approved/rejected

## 🧪 Testing

Once configured, test with:
```
https://baobab-mlm.onrender.com/api/admin/test-email/youremail@example.com
```

## 💰 Pricing

- **Free**: 100 emails/day forever (3,000/month)
- **Essentials**: $19.95/month for 50,000 emails
- **Pro**: $89.95/month for 100,000 emails

## ✅ Advantages

- No domain required for testing
- Instant setup (5 minutes)
- 100 free emails/day
- Better deliverability than Gmail
- Built-in analytics
- Email activity tracking
- Bounce and spam handling

## 🎯 Quick Start Checklist

- [ ] Create SendGrid account
- [ ] Create API key
- [ ] Verify single sender email
- [ ] Add SENDGRID_API_KEY to Render
- [ ] Add FROM_EMAIL to Render (verified email)
- [ ] Test with test-email endpoint
- [ ] Register a user to test OTP email

## 📝 Notes

- Use verified sender email as FROM_EMAIL
- Free tier: 100 emails/day is plenty for testing
- All emails sent asynchronously
- Failures logged but don't block operations
- Can add domain later for custom email

## 🔗 Useful Links

- [SendGrid Dashboard](https://app.sendgrid.com/)
- [API Keys](https://app.sendgrid.com/settings/api_keys)
- [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
- [Email Activity](https://app.sendgrid.com/email_activity)
