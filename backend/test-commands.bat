@echo off
echo Starting Baobab MLM Testing...

echo.
echo 1. Installing dependencies...
cd backend
call npm install
cd ..
call npm install

echo.
echo 2. Starting backend server...
start cmd /k "cd backend && npm start"

echo.
echo 3. Waiting for backend to start...
timeout /t 5

echo.
echo 4. Starting frontend...
start cmd /k "npm start"

echo.
echo 5. Running API tests...
timeout /t 10
node test-api.js

echo.
echo Testing setup complete!
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3000
echo - Admin Login: admin@baobab.com / admin123
pause