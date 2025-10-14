@echo off
echo Pushing Matrix Stage Fix to GitHub...
echo.

git add backend/src/controllers/userController.js
git add backend/src/services/mlmService.js
git add backend/database/fix-no-stage-matrix.sql
git add backend/run-stage-fix.js
git add MATRIX_STAGE_FIX.md
git add FIX_INSTRUCTIONS.md

git commit -m "Fix: Correct matrix stage progression - no_stage should have 4 slots, prevent auto-upgrade to feeder"

git push origin main

echo.
echo ✅ Changes pushed to GitHub!
echo.
echo Next steps:
echo 1. Render will auto-deploy the backend
echo 2. After deployment, run the migration:
echo    - Go to Render Dashboard
echo    - Open Shell for your backend service
echo    - Run: node run-stage-fix.js
echo.
pause
