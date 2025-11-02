@echo off
echo ========================================
echo Verifying Exchange Rate Implementation
echo ========================================
echo.

echo Checking files exist...
echo.

if exist "src\components\admin\ExchangeRateManager.js" (
    echo [OK] ExchangeRateManager.js exists
) else (
    echo [FAIL] ExchangeRateManager.js NOT FOUND
)

if exist "src\controllers\exchangeRateController.js" (
    echo [OK] exchangeRateController.js exists
) else (
    echo [FAIL] exchangeRateController.js NOT FOUND
)

if exist "src\routes\exchangeRate.js" (
    echo [OK] exchangeRate.js exists
) else (
    echo [FAIL] exchangeRate.js NOT FOUND
)

echo.
echo Checking AdminSettings has exchange rate tab...
findstr /C:"ExchangeRateManager" src\pages\admin\AdminSettings.js >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] AdminSettings imports ExchangeRateManager
) else (
    echo [FAIL] AdminSettings does NOT import ExchangeRateManager
)

findstr /C:"exchange" src\pages\admin\AdminSettings.js >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] AdminSettings has exchange tab
) else (
    echo [FAIL] AdminSettings does NOT have exchange tab
)

echo.
echo ========================================
echo Verification Complete
echo ========================================
echo.
echo If all checks pass, try:
echo 1. Clear browser cache (Ctrl+Shift+Delete)
echo 2. Hard refresh (Ctrl+F5)
echo 3. Wait for Vercel deployment to complete
echo.
pause
