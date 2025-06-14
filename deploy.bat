@echo off
echo ====================================
echo  PDF Converter Web - Deploy Script
echo ====================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Go to https://git-scm.com/download/win
    echo 2. Download and install Git for Windows
    echo 3. Restart PowerShell and run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org
    echo 2. Download and install the latest LTS version
    echo 3. Restart PowerShell and run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Initialize Git if not already done
if not exist ".git" (
    echo 🔧 Initializing Git repository...
    git init
    echo ✅ Git repository initialized
    echo.
)

REM Add all files
echo 📦 Adding files to Git...
git add .

REM Commit
echo 💾 Creating commit...
git commit -m "Deploy: PDF Converter Web App - %date% %time%"

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  No GitHub remote found!
    echo.
    echo To complete deployment:
    echo 1. Create a new repository on GitHub.com
    echo 2. Name it: pdf-converter-web
    echo 3. Make it PUBLIC (for free hosting)
    echo 4. Copy the repository URL
    echo 5. Run this command:
    echo    git remote add origin https://github.com/YOUR-USERNAME/pdf-converter-web.git
    echo 6. Then run: git push -u origin main
    echo.
    echo After pushing to GitHub:
    echo 1. Go to vercel.com
    echo 2. Sign up with GitHub
    echo 3. Import your repository
    echo 4. Deploy automatically
    echo.
) else (
    echo 🚀 Pushing to GitHub...
    git push
    if %errorlevel% equ 0 (
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo 🌐 Next steps:
        echo 1. Go to vercel.com
        echo 2. Import your GitHub repository
        echo 3. Deploy your app
        echo.
        echo Or use Vercel CLI:
        echo   npm install -g vercel
        echo   vercel --prod
        echo.
    ) else (
        echo ❌ Failed to push to GitHub
        echo.
        echo Please check:
        echo 1. GitHub repository exists
        echo 2. You have push permissions
        echo 3. Remote URL is correct
        echo.
    )
)

echo ====================================
echo  Deploy script completed!
echo ====================================
echo.
pause
