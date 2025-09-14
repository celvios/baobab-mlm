# Baobab MLM Platform

## Deployment Instructions

### Backend (Render)
1. Push backend code to GitHub
2. Connect Render to your GitHub repository
3. Set environment variables in Render dashboard:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (random secure string)
   - `NODE_ENV=production`
   - `PORT=5000`
   - `CORS_ORIGIN=https://baobab-mlm.vercel.app`

### Frontend (Vercel)
1. Push frontend code to GitHub
2. Connect Vercel to your GitHub repository
3. Set environment variables in Vercel dashboard:
   - `REACT_APP_API_URL=https://your-backend-url.onrender.com/api`
   - `REACT_APP_FRONTEND_URL=https://your-frontend-url.vercel.app`

### Database Setup
Create PostgreSQL database with required tables using the schema in `/backend/database/schema.sql`

### URLs
- Frontend: https://baobab-mlm.vercel.app
- Backend: https://baobab-backend.onrender.com
- Admin Panel: https://baobab-mlm.vercel.app/admin