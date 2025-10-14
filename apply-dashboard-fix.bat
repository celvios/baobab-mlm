@echo off
echo ========================================
echo Dashboard Lock Fix - Baobab MLM
echo ========================================
echo.

echo This script will apply the database migration to fix the dashboard lock issue.
echo.
echo What it does:
echo - Adds dashboard_unlocked and deposit_confirmed columns
echo - Changes default mlm_level from 'feeder' to 'no_stage'
echo - Updates existing users to correct stage
echo.

set /p DB_NAME="Enter database name (default: baobab_mlm): "
if "%DB_NAME%"=="" set DB_NAME=baobab_mlm

set /p DB_USER="Enter database user (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

echo.
echo Running migration on database: %DB_NAME%
echo.

cd backend
psql -U %DB_USER% -d %DB_NAME% -f database\fix-dashboard-lock.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Restart your backend server
    echo 2. Test by registering a new user
    echo 3. Verify dashboard shows "No Stage" and is locked
    echo.
) else (
    echo.
    echo ========================================
    echo Migration failed!
    echo ========================================
    echo.
    echo Please check:
    echo 1. PostgreSQL is running
    echo 2. Database credentials are correct
    echo 3. Database exists
    echo.
)

pause
