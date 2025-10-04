# Render Environment Variables Setup Guide

## Critical Missing Environment Variables

Your OTP emails are not being sent because these environment variables are **NOT SET** on Render:

### Required Variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://baobab-mlm.vercel.app
```

## Step-by-Step Setup on Render

### 1. Get Gmail App Password

Before setting up Render, you need a Gmail App Password:

1. **Go to Google Account**: https://myaccount.google.com/
2. **Enable 2-Step Verification**:
   - Go to Security → 2-Step Verification
   - Follow the setup process
3. **Generate App Password**:
   - Go to Security → App Passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Baobab MLM"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
   - Remove spaces: `abcdefghijklmnop`

### 2. Set Environment Variables on Render

1. **Login to Render**: https://dashboard.render.com/
2. **Select your backend service** (baobab-mlm)
3. **Go to Environment tab**
4. **Add these variables**:

   | Key | Value | Example |
   |-----|-------|---------|
   | `EMAIL_USER` | Your Gmail address | `yourname@gmail.com` |
   | `EMAIL_PASS` | App password from step 1 | `abcdefghijklmnop` |
   | `FRONTEND_URL` | Your Vercel frontend URL | `https://baobab-mlm.vercel.app` |

5. **Click "Save Changes"**
6. **Render will automatically restart your service**

### 3. Verify Setup

After Render restarts (takes 2-3 minutes):

1. **Test Registration**:
   - Go to your frontend: https://baobab-mlm.vercel.app/register
   - Register a new user with a real email
   - Check your email inbox for OTP

2. **Check Render Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for: `OTP email sent successfully to [email]`
   - If you see errors, check the email credentials

3. **Test OTP Verification**:
   - Enter the 6-digit OTP from email
   - Should verify successfully
   - Then login with your credentials

## Current Environment Variables on Render

You should already have these (check and confirm):

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://baobab-mlm.vercel.app
```

## Troubleshooting

### Email Not Sending?

**Check Render Logs for:**
```
Email transporter configured with: yourname@gmail.com
OTP email sent successfully to [email]
```

**If you see errors:**

1. **"Invalid login"**: 
   - App password is wrong
   - 2-Step Verification not enabled
   - Using regular password instead of app password

2. **"Email service not available"**:
   - EMAIL_USER or EMAIL_PASS not set
   - Restart Render service after setting variables

3. **"Connection timeout"**:
   - Gmail SMTP might be blocked
   - Try using SendGrid instead (see alternative below)

### Alternative: Use SendGrid

If Gmail doesn't work, use SendGrid:

1. **Sign up**: https://sendgrid.com/ (Free tier: 100 emails/day)
2. **Get API Key**: Settings → API Keys → Create API Key
3. **Add to Render**:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   FROM_EMAIL=noreply@yourdomain.com
   ```
4. **Update code** to use SendGrid service (already implemented in codebase)

## Testing Email Locally

Before deploying, test email locally:

1. **Create `.env` file** in backend folder:
   ```
   EMAIL_USER=yourname@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

2. **Run test script**:
   ```bash
   cd backend
   node test-email.js
   ```

3. **Check output**:
   ```
   Testing email configuration...
   EMAIL_USER: yourname@gmail.com
   EMAIL_PASS: Set
   ✅ Email sent successfully!
   ```

## Security Notes

- **Never commit** `.env` file to Git
- **Use App Passwords**, not your actual Gmail password
- **Rotate credentials** if exposed
- **Monitor usage** in Gmail settings

## Next Steps After Setup

1. ✅ Set EMAIL_USER on Render
2. ✅ Set EMAIL_PASS on Render
3. ✅ Set FRONTEND_URL on Render
4. ✅ Wait for Render to restart
5. ✅ Test registration with real email
6. ✅ Verify OTP received
7. ✅ Complete verification flow
8. ✅ Test login

## Support

If issues persist after setup:
- Check Render logs for specific errors
- Verify Gmail App Password is correct
- Ensure 2-Step Verification is enabled
- Try SendGrid as alternative
