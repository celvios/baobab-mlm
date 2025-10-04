@echo off
echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit - Baobab MLM platform with email OTP verification"

echo Adding remote repository...
git remote add origin https://github.com/celvios/baobab-mlm.git

echo Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo Done! Code pushed to GitHub.
pause
