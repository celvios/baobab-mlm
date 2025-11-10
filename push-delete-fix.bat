@echo off
echo Pushing admin delete button fix...

git add .
git commit -m "Fix admin delete button functionality - add deactivate user endpoint"
git push

echo.
echo Push complete!
pause
