@echo off
echo ========================================
echo Pushing Deposit Request Fix
echo ========================================
echo.

git add .
git commit -m "Fix: Admin deposit requests now visible - handle payment_proof column"
git push origin main

echo.
echo ========================================
echo Push Complete!
echo ========================================
pause
