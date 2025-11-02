@echo off
echo ========================================
echo Baobab MLM - Spillover System Setup
echo ========================================
echo.

cd backend

echo [1/3] Applying database migration...
node apply-spillover-migration.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Migration failed! Please check the error above.
    pause
    exit /b 1
)

echo.
echo [2/3] Running system tests...
node test-spillover.js

echo.
echo [3/3] Setup complete!
echo.
echo ✅ Spillover system is now active!
echo.
echo Features enabled:
echo - Spillover referral tracking
echo - Email notifications to placement parents
echo - Dashboard notifications
echo - Team view with spillover indicators
echo.
echo Next steps:
echo 1. Restart your backend server: npm run dev
echo 2. Test by creating 3+ referrals with same code
echo 3. Check email and dashboard notifications
echo 4. Run 'node test-spillover.js' anytime to verify
echo.
echo For more information, see SPILLOVER_SYSTEM.md
echo.
pause
