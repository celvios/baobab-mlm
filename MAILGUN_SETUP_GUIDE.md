# Mailgun Email Service Setup Guide

## ✅ What's Been Done

- Removed Gmail/Nodemailer completely
- Installed Mailgun.js and form-data packages
- Updated all email functions to use Mailgun
- Centralized email sending with single `sendEmail()` function

## 🚀 Mailgun Setup Steps

### 1. Create Mailgun Account
1. Go to [https://www.mailgun.com/](https://www.mailgun.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key
1. Login to Mailgun dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **Private API Key**

### 3. Add Domain
You have two options:

#### Option A: Use Mailgun Sandbox Domain (Testing)
- Mailgun provides a sandbox domain for testing
- Format: `sandboxXXXXXXXX.mailgun.org`
- Limited to 300 emails/day
- Can only send to authorized recipients

#### Option B: Add Your Own Domain (Production)
1. Go to **Sending** → **Domains**
2. Click **Add New Domain**
3. Enter your domain (e.g., `mail.baobab.com` or `baobab.com`)
4. Follow DNS setup instructions:
   - Add TXT records for domain verification
   - Add MX records for receiving
   - Add CNAME records for tracking

### 4. Configure Environment Variables

Add these to your Render backend environment variables:

```env
MAILGUN_API_KEY=your-private-api-key-here
MAILGUN_DOMAIN=your-domain-here
FROM_EMAIL=Baobab MLM <noreply@yourdomain.com>
FRONTEND_URL=https://baobab-frontend.vercel.app
```

**Example values:**
```env
MAILGUN_API_KEY=key-1234567890abcdef1234567890abcdef
MAILGUN_DOMAIN=sandboxabcd1234.mailgun.org
FROM_EMAIL=Baobab MLM <noreply@sandboxabcd1234.mailgun.org>
FRONTEND_URL=https://baobab-frontend.vercel.app
```

### 5. Verify Recipients (Sandbox Only)
If using sandbox domain:
1. Go to **Sending** → **Authorized Recipients**
2. Add email addresses that should receive test emails
3. Recipients must verify their email

## 📧 Email Functions Available

All emails now use Mailgun:

1. **sendOTPEmail** - Registration verification code
2. **sendWelcomeEmail** - Welcome after verification
3. **sendPasswordResetEmail** - Password reset link
4. **sendReferralRegisteredEmail** - New team member notification
5. **sendEarningsEmail** - Earnings notification
6. **sendDepositPendingEmail** - Deposit request received
7. **sendDepositApprovedEmail** - Deposit approved
8. **sendDepositRejectedEmail** - Deposit rejected
9. **sendWithdrawalPendingEmail** - Withdrawal request received
10. **sendWithdrawalApprovedEmail** - Withdrawal approved
11. **sendWithdrawalRejectedEmail** - Withdrawal rejected

## 🧪 Testing Emails

### Test with Sandbox Domain
1. Add your email as authorized recipient
2. Trigger any email action (register, deposit, etc.)
3. Check your inbox

### Test with Production Domain
1. Complete DNS setup
2. Wait for DNS propagation (up to 48 hours)
3. Verify domain in Mailgun dashboard
4. Send test emails

## 📊 Monitoring

### View Email Logs
1. Go to **Sending** → **Logs**
2. See all sent emails, deliveries, and failures
3. Filter by status, recipient, or date

### Check Statistics
1. Go to **Analytics** → **Overview**
2. View delivery rates, opens, clicks
3. Monitor bounce and complaint rates

## 🔧 Troubleshooting

### Emails Not Sending
1. Check Mailgun logs for errors
2. Verify API key is correct
3. Ensure domain is verified
4. Check recipient is authorized (sandbox)

### DNS Issues
1. Use Mailgun's DNS checker
2. Wait for propagation (up to 48 hours)
3. Verify all records are added correctly

### Rate Limits
- Sandbox: 300 emails/day
- Flex plan: 1,000 emails/month free
- Foundation plan: 50,000 emails/month

## 💰 Pricing

- **Free Tier**: 1,000 emails/month (Flex plan)
- **Foundation**: $35/month for 50,000 emails
- **Growth**: $80/month for 100,000 emails
- **Scale**: Custom pricing

## 🎯 Production Checklist

- [ ] Create Mailgun account
- [ ] Get API key
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Verify domain
- [ ] Update environment variables on Render
- [ ] Test all email types
- [ ] Monitor delivery rates
- [ ] Set up email templates (optional)
- [ ] Configure webhooks (optional)

## 📝 Notes

- All emails are sent asynchronously
- Failures are logged but don't block operations
- Email templates use inline CSS for compatibility
- Mailgun provides better deliverability than Gmail
- No daily sending limits with verified domain
- Built-in analytics and tracking
- Automatic bounce and complaint handling

## 🔗 Useful Links

- [Mailgun Dashboard](https://app.mailgun.com/)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [DNS Setup Guide](https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain)
- [API Reference](https://documentation.mailgun.com/en/latest/api_reference.html)
