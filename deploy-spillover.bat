@echo off
echo ========================================
echo Deploy Spillover System to Render
echo ========================================
echo.

echo [1/3] Committing changes...
git add .
git commit -m "Add spillover notification system"

if %errorlevel% neq 0 (
    echo No changes to commit or git error
)

echo.
echo [2/3] Pushing to repository...
git push

if %errorlevel% neq 0 (
    echo.
    echo ❌ Push failed! Check your git configuration.
    pause
    exit /b 1
)

echo.
echo [3/3] Deployment initiated!
echo.
echo ✅ Code pushed to repository
echo.
echo Next steps:
echo 1. Render will auto-deploy (check dashboard)
echo 2. After deploy, go to Render Shell and run:
echo    node apply-spillover-migration.js
echo 3. Test with: node test-spillover.js
echo.
echo Or manually run migration:
echo psql $DATABASE_URL -f backend/database/migrations/add-spillover-tracking.sql
echo.
pause
