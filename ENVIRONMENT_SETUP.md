# Environment Variables Setup

## Backend Environment Variables (Render)

Set these in your Render dashboard:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://baobab-mlm.vercel.app

# Email Configuration (REQUIRED for OTP)
# Option 1: Gmail (may not work on free hosting)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Option 2: SendGrid (recommended for production)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://baobab-mlm.vercel.app
```

## Frontend Environment Variables (Vercel)

Set these in your Vercel dashboard:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
```

## SendGrid Setup (Recommended)

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com/
   - Sign up for free (100 emails/day)
   - Verify your email

2. **Get API Key:**
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Choose "Restricted Access"
   - Under "Mail Send", select "Full Access"
   - Copy the API key (starts with `SG.`)

3. **Set Environment Variables in Render:**
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

## Gmail App Password Setup (Alternative)

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use this app password (not your regular password) for EMAIL_PASS
5. Note: May not work on free hosting due to SMTP restrictions

## Testing Email Service

### Local Testing (Before Deployment)

1. **Set up environment variables in `.env` file:**
```bash
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

2. **Run comprehensive email test:**
```bash
node test-email-local.js your-email@gmail.com
```

3. **Test individual email types:**
```bash
# Test OTP email only
node backend/test-email.js

# Test via API endpoint (start server first)
GET http://localhost:5000/api/test-email/your-email@gmail.com
```

4. **Start backend server for API testing:**
```bash
cd backend
npm start
```

### Production Testing (After Deployment)

Test email service on deployed backend:
```
GET https://your-backend-url.onrender.com/api/test-email/your-email@gmail.com
```

## Common Issues

1. **Orders showing local data**: Check REACT_APP_API_URL is set correctly
2. **OTP not sending**: Verify EMAIL_USER and EMAIL_PASS are set
3. **CORS errors**: Ensure CORS_ORIGIN matches your frontend URL
4. **FRONTEND_URL showing "NOT SET"**: Add FRONTEND_URL=https://baobab-mlm.vercel.app to Render environment variables
5. **Connection timeout on email test**: Try quick test endpoint first:
   ```
   https://baobab-mlm.onrender.com/api/quick-otp-test/your-email@gmail.com
   ```
6. **"createTransporter is not a function"**: Fixed - redeploy backend after code update
7. **Infinite loading on test endpoints**: Check Render logs for startup errors. Test basic endpoints first:
   ```
   https://baobab-mlm.onrender.com/api/health
   https://baobab-mlm.onrender.com/api/test
   ```
8. **SMTP Connection timeout (ETIMEDOUT)**: Free hosting blocks SMTP ports. Email will work when:
   - Using paid Render plan, or
   - Using email service like SendGrid/Mailgun, or
   - Testing locally with proper network access
   
   Verify config without sending: `https://baobab-mlm.onrender.com/api/verify-email-setup`