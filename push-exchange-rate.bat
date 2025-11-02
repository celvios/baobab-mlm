@echo off
echo ========================================
echo Pushing Exchange Rate Management System
echo ========================================
echo.

echo Adding files to git...
git add backend/database/migrations/add-exchange-rates.sql
git add src/controllers/exchangeRateController.js
git add src/routes/exchangeRate.js
git add src/components/admin/ExchangeRateManager.js
git add src/services/currencyService.js
git add src/routes/admin.js
git add src/server.js
git add src/pages/admin/AdminSettings.js
git add run-exchange-rate-migration.js
git add setup-exchange-rate.bat
git add EXCHANGE_RATE_SETUP.md
git add EXCHANGE_RATE_SUMMARY.md
git add ADMIN_EXCHANGE_RATE_GUIDE.md

echo.
echo Committing changes...
git commit -m "Add admin exchange rate management system - Disable external API, add admin control for exchange rates"

echo.
echo Pushing to remote...
git push

echo.
echo ========================================
echo Push Complete!
echo ========================================
echo.
pause
