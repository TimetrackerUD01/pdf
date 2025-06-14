# PDF Converter Web - PowerShell Deploy Script
# =====================================

Write-Host "🎯 PDF Converter Web - Deploy Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check Git installation
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "git")) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Download and install Git for Windows" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Git is installed" -ForegroundColor Green

# Check Node.js installation
if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://nodejs.org" -ForegroundColor White
    Write-Host "2. Download and install the latest LTS version" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Node.js is installed" -ForegroundColor Green
Write-Host ""

# Check if this is a Git repository
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    Write-Host ""
}

# Add and commit files
Write-Host "📦 Preparing files for deployment..." -ForegroundColor Yellow
git add .

$commitMessage = "Deploy: PDF Converter Web App - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Check if remote exists
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host ""
    Write-Host "⚠️  No GitHub remote found!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎯 To complete deployment:" -ForegroundColor Cyan
    Write-Host "1. 🌐 Go to GitHub.com and create a new repository" -ForegroundColor White
    Write-Host "2. 📝 Name it: pdf-converter-web" -ForegroundColor White
    Write-Host "3. 🔓 Make it PUBLIC (for free hosting)" -ForegroundColor White
    Write-Host "4. 📋 Copy the repository URL" -ForegroundColor White
    Write-Host "5. 🔗 Connect this project:" -ForegroundColor White
    Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/pdf-converter-web.git" -ForegroundColor Gray
    Write-Host "6. 🚀 Push to GitHub:" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 After pushing to GitHub, choose a hosting platform:" -ForegroundColor Cyan
    Write-Host "• 🔥 Vercel (recommended): https://vercel.com" -ForegroundColor White
    Write-Host "• 🟣 Heroku: https://heroku.com" -ForegroundColor White
    Write-Host "• 🚄 Railway: https://railway.app" -ForegroundColor White
    Write-Host "• 🌊 Netlify: https://netlify.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    
    try {
        git push 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Next steps - Choose your hosting platform:" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🔥 VERCEL (Recommended - Easiest):" -ForegroundColor Yellow
            Write-Host "1. Go to https://vercel.com" -ForegroundColor White
            Write-Host "2. Sign up with GitHub" -ForegroundColor White
            Write-Host "3. Click 'New Project'" -ForegroundColor White
            Write-Host "4. Import your repository" -ForegroundColor White
            Write-Host "5. Deploy automatically!" -ForegroundColor White
            Write-Host ""
            Write-Host "⚡ Or use Vercel CLI for instant deploy:" -ForegroundColor Yellow
            Write-Host "   npm install -g vercel" -ForegroundColor Gray
            Write-Host "   vercel --prod" -ForegroundColor Gray
            Write-Host ""
        } else {
            throw "Git push failed"
        }
    } catch {
        Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Please check:" -ForegroundColor Yellow
        Write-Host "1. GitHub repository exists and is accessible" -ForegroundColor White
        Write-Host "2. You have push permissions" -ForegroundColor White
        Write-Host "3. Remote URL is correct" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Current remote:" -ForegroundColor Yellow
        git remote -v
        Write-Host ""
    }
}

# Display project info
Write-Host "📊 Project Summary:" -ForegroundColor Cyan
Write-Host "• Name: PDF Converter Web" -ForegroundColor White
Write-Host "• Type: Full-stack Node.js app" -ForegroundColor White
Write-Host "• Features: Word/Excel/PPT to PDF, PDF tools" -ForegroundColor White
Write-Host "• Tech: Express.js, HTML/CSS/JS, pdf-lib" -ForegroundColor White
Write-Host "• Ready for: Vercel, Heroku, Railway, Netlify" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Deploy script completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
