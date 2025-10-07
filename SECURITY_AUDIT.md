# Security Audit Report - Baobab MLM

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. **Inconsistent JWT Token Field Names**
- **Location**: `adminAuth.js` vs `auth.js`
- **Issue**: adminAuth uses `decoded.userId` but auth uses `decoded.id`
- **Risk**: Admin authentication will always fail
- **Fix**: Standardize to use `decoded.id`

### 2. **Hardcoded JWT Secret Fallback**
- **Location**: `adminAuth.js` line 12
- **Issue**: `process.env.JWT_SECRET || 'your-secret-key'`
- **Risk**: If JWT_SECRET not set, uses weak default
- **Fix**: Remove fallback, fail if not set

### 3. **SQL Injection Risk in Dynamic Queries**
- **Location**: `admin.js` - order update endpoint
- **Issue**: Dynamic SQL with `Object.keys()` without validation
- **Risk**: Potential SQL injection
- **Fix**: Whitelist allowed fields

### 4. **No Rate Limiting**
- **Location**: All endpoints
- **Issue**: No protection against brute force attacks
- **Risk**: Password guessing, DDoS attacks
- **Fix**: Add express-rate-limit

### 5. **Sensitive Data in Logs**
- **Location**: Multiple controllers
- **Issue**: Logging full error objects with potential PII
- **Risk**: Data leakage in logs
- **Fix**: Sanitize logs

## 🟡 HIGH PRIORITY ISSUES

### 6. **No Input Validation on Admin Endpoints**
- **Location**: Deposit/Withdrawal approval
- **Issue**: No validation of amount, depositId
- **Risk**: Invalid data processing
- **Fix**: Add validation middleware

### 7. **CORS Not Configured**
- **Location**: `server.js`
- **Issue**: May allow any origin
- **Risk**: CSRF attacks
- **Fix**: Configure specific origins

### 8. **No Request Size Limits**
- **Location**: Express app
- **Issue**: No body size limits
- **Risk**: Memory exhaustion attacks
- **Fix**: Add body-parser limits

### 9. **Weak Password Requirements**
- **Location**: Registration validation
- **Issue**: Only checks length >= 6
- **Risk**: Weak passwords
- **Fix**: Add complexity requirements

### 10. **No Account Lockout**
- **Location**: Login endpoint
- **Issue**: Unlimited login attempts
- **Risk**: Brute force attacks
- **Fix**: Add lockout after failed attempts

## 🟢 MEDIUM PRIORITY ISSUES

### 11. **Exposed Test Endpoints in Production**
- **Location**: `admin.js`
- **Issue**: `/test-email`, `/test-withdrawals`, etc.
- **Risk**: Information disclosure
- **Fix**: Remove or protect with environment check

### 12. **No HTTPS Enforcement**
- **Location**: Server configuration
- **Issue**: May accept HTTP
- **Risk**: Man-in-the-middle attacks
- **Fix**: Enforce HTTPS in production

### 13. **Sensitive Data in Frontend**
- **Location**: LocalStorage usage
- **Issue**: Storing tokens in localStorage
- **Risk**: XSS attacks can steal tokens
- **Fix**: Use httpOnly cookies

### 14. **No Email Verification Expiry Check**
- **Location**: OTP verification
- **Issue**: Checks expiry but no cleanup
- **Risk**: Old tokens remain valid
- **Fix**: Add cleanup job

### 15. **Referral Code Predictability**
- **Location**: `generateReferralCode.js`
- **Issue**: May be predictable
- **Risk**: Code guessing
- **Fix**: Use crypto.randomBytes

## 🔵 LOW PRIORITY ISSUES

### 16. **Console.log in Production**
- **Location**: Multiple files
- **Issue**: Debug logs in production
- **Risk**: Performance, information disclosure
- **Fix**: Use proper logging library

### 17. **No API Versioning**
- **Location**: All routes
- **Issue**: `/api/` without version
- **Risk**: Breaking changes affect all clients
- **Fix**: Add `/api/v1/`

### 18. **Missing Error Boundaries**
- **Location**: Frontend components
- **Issue**: Unhandled errors crash app
- **Risk**: Poor UX
- **Fix**: Add error boundaries

### 19. **No Database Connection Pooling Limits**
- **Location**: Database config
- **Issue**: May exhaust connections
- **Risk**: Database overload
- **Fix**: Set max pool size

### 20. **Unvalidated Redirects**
- **Location**: Password reset flow
- **Issue**: No validation of redirect URLs
- **Risk**: Open redirect vulnerability
- **Fix**: Whitelist allowed URLs

## 📋 RECOMMENDATIONS

### Immediate Actions (This Week)
1. Fix JWT token field inconsistency
2. Remove hardcoded secrets
3. Add rate limiting
4. Fix SQL injection risks
5. Configure CORS properly

### Short Term (This Month)
6. Add input validation
7. Implement account lockout
8. Remove test endpoints
9. Add request size limits
10. Improve password requirements

### Long Term (Next Quarter)
11. Migrate to httpOnly cookies
12. Add comprehensive logging
13. Implement API versioning
14. Add monitoring/alerting
15. Security penetration testing

## 🛡️ SECURITY BEST PRACTICES TO IMPLEMENT

1. **Environment Variables**: Never commit `.env` files
2. **Dependencies**: Regular `npm audit` and updates
3. **Secrets Rotation**: Rotate JWT secrets periodically
4. **Backup Strategy**: Regular encrypted backups
5. **Incident Response**: Document security incident procedures
6. **Access Control**: Principle of least privilege
7. **Audit Logging**: Log all sensitive operations
8. **Data Encryption**: Encrypt sensitive data at rest
9. **Security Headers**: Add helmet.js
10. **Content Security Policy**: Implement CSP headers

## 📊 RISK ASSESSMENT

| Issue | Severity | Likelihood | Impact | Priority |
|-------|----------|------------|--------|----------|
| JWT Inconsistency | Critical | High | High | P0 |
| Hardcoded Secrets | Critical | Medium | High | P0 |
| SQL Injection | Critical | Low | High | P0 |
| No Rate Limiting | High | High | Medium | P1 |
| No Input Validation | High | Medium | Medium | P1 |
| Test Endpoints | Medium | Low | Low | P2 |

## ✅ FIXES APPLIED

- [x] JWT token field standardization
- [x] Remove hardcoded JWT secret fallback
- [x] Add SQL injection protection
- [ ] Add rate limiting (requires npm package)
- [ ] Add input validation middleware
- [ ] Configure CORS
- [ ] Add helmet.js security headers
