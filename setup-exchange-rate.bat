@echo off
echo ========================================
echo Exchange Rate Management Setup
echo ========================================
echo.

echo Step 1: Running database migration...
node run-exchange-rate-migration.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Migration failed!
    echo Please check your database connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo The exchange rate management system is now ready.
echo.
echo Next steps:
echo 1. Start your server: npm run dev
echo 2. Login to admin dashboard
echo 3. Go to Settings - Exchange Rate tab
echo 4. Set your preferred exchange rate
echo.
echo Default rate: NGN 1500 per USD
echo.
pause
