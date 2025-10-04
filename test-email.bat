@echo off
echo.
echo ========================================
echo   Baobab MLM - Email Service Test
echo ========================================
echo.

if "%1"=="" (
    echo Usage: test-email.bat your-email@gmail.com
    echo.
    echo Example: test-email.bat john@gmail.com
    echo.
    pause
    exit /b 1
)

echo Testing email service with: %1
echo.

echo [1/3] Testing email configuration...
node test-email-local.js %1

echo.
echo [2/3] Starting backend server test...
echo Press Ctrl+C to stop the server after testing
echo.

cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo [3/3] Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo Testing API endpoint...
echo Open this URL in your browser:
echo http://localhost:5000/api/test-email/%1
echo.

echo ========================================
echo Test completed! Check your email inbox.
echo ========================================
pause