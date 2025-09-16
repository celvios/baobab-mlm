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
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=https://baobab-mlm.vercel.app
```

## Frontend Environment Variables (Vercel)

Set these in your Vercel dashboard:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Gmail App Password Setup

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use this app password (not your regular password) for EMAIL_PASS

## Testing Email Service

After deployment, test email service:
```
GET https://your-backend-url.onrender.com/api/test-email/your-email@gmail.com
```

## Common Issues

1. **Orders showing local data**: Check REACT_APP_API_URL is set correctly
2. **OTP not sending**: Verify EMAIL_USER and EMAIL_PASS are set
3. **CORS errors**: Ensure CORS_ORIGIN matches your frontend URL