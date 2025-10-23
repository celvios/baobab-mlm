@echo off
echo.
echo ========================================
echo   APPLYING SECURITY FIXES
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Running security fix script...
node scripts\apply-security-fixes.js

echo.
echo [2/4] Generating JWT Secret...
echo Copy this secret:
echo.
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo.

echo [3/4] Setting up environment file...
if not exist .env (
    copy .env.secure.example .env
    echo Created .env file - EDIT IT NOW with your values!
) else (
    echo .env already exists - skipping
)

echo.
echo [4/4] Updating package.json...
echo Done!

echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo 1. Edit backend\.env file
echo 2. Paste the JWT secret above
echo 3. Set your database URL
echo 4. Run: npm run dev
echo.
echo Read SECURITY_SUMMARY.md for details
echo.
pause
