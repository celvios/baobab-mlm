# Email Setup Guide for OTP Functionality

## Why OTP Emails Aren't Being Sent

Your `.env` file currently has placeholder values:
```
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## How to Fix

### Step 1: Get a Gmail Account
Use an existing Gmail account or create a new one specifically for your application.

### Step 2: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### Step 3: Generate App Password
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other** as the device and name it "Baobab MLM"
4. Click **Generate**
5. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 4: Update Your .env File
Edit `backend/.env` and replace with your actual credentials:

```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

**Important:** Remove the spaces from the app password!

### Step 5: Restart Your Backend Server
```bash
cd backend
npm start
```

## Testing OTP

After setup, when a user registers:
1. The OTP will be logged to the console (for debugging)
2. An email will be sent to the user's email address
3. The user can enter the 6-digit code on the verification page

## Troubleshooting

**If emails still don't send:**
- Check console logs for error messages
- Verify the app password has no spaces
- Make sure 2FA is enabled on the Gmail account
- Check if Gmail is blocking "less secure apps" (shouldn't be an issue with app passwords)

**For production:**
Consider using a professional email service like:
- SendGrid
- AWS SES
- Mailgun
- Postmark

These services are more reliable and have better deliverability than Gmail.