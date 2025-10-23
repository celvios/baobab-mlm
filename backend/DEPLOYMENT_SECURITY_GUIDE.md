# Deployment Security Guide

## Pre-Deployment Checklist

### 1. Environment Setup

```bash
# Generate JWT Secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy secure environment template
cp .env.secure.example .env
```

### 2. Update .env File

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=<generated-64-char-hex>
SENDGRID_API_KEY=<your-sendgrid-key>
ALLOWED_ORIGINS=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3. Remove Dangerous Files

Delete these files before deployment:
```bash
rm create-admin-baobab.js
rm update-admin-password.js
rm generate-referrals-local.js
rm debug-*.js
rm test-*.js
```

### 4. Switch to Secure Server

Update `package.json`:
```json
{
  "scripts": {
    "start": "node src/server.secure.js",
    "dev": "nodemon src/server.secure.js"
  }
}
```

### 5. Database Security

- Enable SSL on database
- Use connection pooling
- Set up read replicas if needed
- Enable query logging for auditing
- Regular backups

### 6. Admin Account Setup

```bash
# Create admin via secure endpoint (one-time)
curl -X POST https://yourapi.com/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "fullName": "Admin User"
  }'

# Then immediately change password through UI
```

### 7. Firewall Rules

- Allow only ports 80, 443
- Restrict database access to app servers only
- Enable DDoS protection
- Set up WAF (Web Application Firewall)

### 8. Monitoring Setup

- Enable error logging (Sentry, LogRocket)
- Set up uptime monitoring
- Configure alerts for:
  - Failed login attempts
  - Database errors
  - High CPU/memory usage
  - Unusual traffic patterns

### 9. SSL/TLS Configuration

- Use Let's Encrypt or commercial SSL
- Enable HSTS
- Configure TLS 1.2+ only
- Disable weak ciphers

### 10. Rate Limiting

Verify these are active:
- Login: 5 attempts per 15 minutes
- API: 100 requests per 15 minutes
- Registration: 3 per hour per IP

## Post-Deployment

### Immediate Actions

1. **Test CSRF Protection**
```bash
# Should fail without token
curl -X POST https://yourapi.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'
```

2. **Test CORS**
```bash
# Should fail from unauthorized origin
curl -X GET https://yourapi.com/api/health \
  -H "Origin: https://malicious.com"
```

3. **Verify SSL**
```bash
curl -I https://yourapi.com/api/health
# Check for security headers
```

4. **Test Rate Limiting**
```bash
# Make 10 rapid requests, should get 429
for i in {1..10}; do
  curl https://yourapi.com/api/health
done
```

### Security Audits

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Scan with OWASP ZAP
- [ ] Penetration testing
- [ ] Code review for security issues
- [ ] Check for exposed secrets in git history

### Regular Maintenance

**Weekly:**
- Review error logs
- Check failed login attempts
- Monitor API usage patterns

**Monthly:**
- Update dependencies
- Review access logs
- Rotate API keys
- Database backup verification

**Quarterly:**
- Security audit
- Penetration testing
- Review and update security policies
- Staff security training

## Incident Response Plan

### If Breach Detected:

1. **Immediate**
   - Take affected systems offline
   - Preserve logs
   - Notify security team

2. **Investigation**
   - Identify breach vector
   - Assess data exposure
   - Document timeline

3. **Remediation**
   - Patch vulnerability
   - Reset all credentials
   - Notify affected users
   - Update security measures

4. **Post-Incident**
   - Conduct post-mortem
   - Update security procedures
   - Implement additional monitoring

## Security Contacts

- Security Team: security@yourdomain.com
- On-Call: +234XXXXXXXXXX
- Incident Response: incidents@yourdomain.com

## Compliance

- [ ] GDPR compliance (if EU users)
- [ ] PCI DSS (if handling payments)
- [ ] Local data protection laws
- [ ] Terms of Service updated
- [ ] Privacy Policy published

## Emergency Procedures

### Database Compromise
```bash
# Rotate database credentials
# Update DATABASE_URL in environment
# Restart all services
# Force password reset for all users
```

### API Key Leak
```bash
# Revoke compromised keys
# Generate new keys
# Update environment variables
# Notify affected services
```

### DDoS Attack
```bash
# Enable CloudFlare/AWS Shield
# Increase rate limits temporarily
# Block malicious IPs
# Scale infrastructure if needed
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
