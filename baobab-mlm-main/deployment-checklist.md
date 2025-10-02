# Deployment Checklist

## Phase 1: Pre-Deployment Setup
- [ ] Create Vercel account
- [ ] Create Render account
- [ ] Create Paystack account (get test/live keys)
- [ ] Setup Gmail app password
- [ ] Create GitHub repository
- [ ] Push code to GitHub

## Phase 2: Backend Deployment
- [ ] Deploy backend to Render
- [ ] Setup PostgreSQL database
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Setup database tables

## Phase 3: Frontend Deployment  
- [ ] Deploy frontend to Vercel
- [ ] Configure environment variables
- [ ] Test frontend-backend connection
- [ ] Test all user flows

## Phase 4: Repurchase System Implementation
- [ ] Add repurchase tracking to database
- [ ] Implement repurchase logic in MLM service
- [ ] Add repurchase UI components
- [ ] Test repurchase workflows

## Phase 5: Real Services Integration
- [ ] Integrate Paystack bank verification
- [ ] Setup real email service
- [ ] Add SMS OTP service
- [ ] Test all integrations

## Phase 6: Production Testing & Launch
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Go live

## Environment Variables Needed

### Backend (Render)
- DATABASE_URL
- JWT_SECRET
- EMAIL_USER
- EMAIL_PASS
- PAYSTACK_SECRET_KEY
- PAYSTACK_PUBLIC_KEY
- NODE_ENV=production

### Frontend (Vercel)
- REACT_APP_API_URL