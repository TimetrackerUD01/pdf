@echo off
echo ========================================
echo   GitHub Repository Setup Script
echo ========================================
echo.

echo Step 1: Create GitHub Repository
echo --------------------------------
echo 1. Go to https://github.com/new
echo 2. Repository name: file-converter-webapp
echo 3. Description: Beautiful orange-red themed online file converter
echo 4. Make it Public
echo 5. DO NOT initialize with README
echo 6. Click Create Repository
echo.

echo Step 2: Get Your Repository URL
echo --------------------------------
echo After creating, GitHub will show you the repository URL
echo It will look like: https://github.com/YOUR-USERNAME/file-converter-webapp.git
echo.

set /p username="Enter your GitHub username: "
set repo_url=https://github.com/%username%/file-converter-webapp.git

echo.
echo Step 3: Adding Remote and Pushing
echo ----------------------------------
echo I'll now add the remote and push your code...
echo.

git remote add origin %repo_url%
if %errorlevel% neq 0 (
    echo Remote might already exist, trying to set URL...
    git remote set-url origin %repo_url%
)

git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Your code is now on GitHub!
    echo Repository URL: %repo_url%
    echo.
    echo Next Steps:
    echo 1. Visit your repository on GitHub
    echo 2. Deploy to Vercel: https://vercel.com/new
    echo 3. Select your repository and deploy
    echo.
) else (
    echo.
    echo ❌ Push failed. Please check:
    echo 1. Repository exists on GitHub
    echo 2. You have write access
    echo 3. Your GitHub credentials are correct
    echo.
)

echo Step 4: Deploy to Vercel
echo -------------------------
echo 1. Go to https://vercel.com
echo 2. Sign in with GitHub
echo 3. Click "New Project"
echo 4. Select your file-converter-webapp repository
echo 5. Click Deploy
echo.

pause
