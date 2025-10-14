@echo off
echo ========================================
echo Git Push - Dashboard Lock Fix
echo ========================================
echo.

echo Checking git status...
git status

echo.
echo ========================================
echo Files to be committed:
echo ========================================
echo - backend/database/fix-dashboard-lock.sql (new)
echo - backend/database/schema.sql (updated)
echo - backend/src/controllers/authController.js (updated)
echo - backend/src/controllers/userController.js (updated)
echo - backend/src/controllers/depositController.js (updated)
echo - DASHBOARD_LOCK_FIX.md (new)
echo - DEPLOY_DASHBOARD_FIX.md (new)
echo.

set /p CONFIRM="Continue with commit and push? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Cancelled.
    pause
    exit /b
)

echo.
echo Adding files...
git add backend/database/fix-dashboard-lock.sql
git add backend/database/schema.sql
git add backend/src/controllers/authController.js
git add backend/src/controllers/userController.js
git add backend/src/controllers/depositController.js
git add DASHBOARD_LOCK_FIX.md
git add DEPLOY_DASHBOARD_FIX.md

echo.
echo Committing...
git commit -m "Fix: Dashboard lock issue - new users now show 'No Stage' correctly

- Added dashboard_unlocked and deposit_confirmed columns
- Changed default mlm_level from 'feeder' to 'no_stage'
- Removed auto-upgrade logic forcing users to Feeder
- Added fallback logic for backward compatibility
- Updated schema for future deployments"

echo.
echo Pushing to remote...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Push successful!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Render will auto-deploy the changes
    echo 2. Run database migration on Render
    echo 3. Test with a new user registration
    echo.
    echo See DEPLOY_DASHBOARD_FIX.md for migration instructions
    echo.
) else (
    echo.
    echo ========================================
    echo Push failed!
    echo ========================================
    echo.
    echo Please check your git configuration and try again.
    echo.
)

pause
