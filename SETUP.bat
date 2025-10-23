@echo off
cd backend && node scripts\apply-security-fixes.js && node -e "console.log('\nJWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))" && if not exist .env copy .env.secure.example .env && echo. && echo Done! Edit backend\.env and run: npm run dev && pause
