@echo off
echo ========================================
echo   Deploy ไปยัง Railway (Backup Plan)
echo ========================================
echo.

echo ✅ ทำไมต้อง Railway?
echo - $5 credit ฟรีทุกเดือน (ใช้ได้ 550+ ชั่วโมง)
echo - ไม่ Sleep (พร้อมใช้ 24/7)
echo - Upload ไฟล์ไม่จำกัดขนาด
echo - Database ฟรี (PostgreSQL, MySQL)
echo - เหมาะสำหรับ Node.js มาก
echo.

echo 📋 ขั้นตอน Deploy Railway:
echo.

echo Step 1: สร้าง GitHub Repository (ถ้ายังไม่มี)
echo --------------------------------------------
set /p has_github="มี GitHub repo แล้วหรือยัง? (y/n): "

if /i "%has_github%"=="n" (
    echo.
    echo กรุณาสร้าง GitHub repo ก่อน:
    echo 1. ไปที่ https://github.com/new
    echo 2. ชื่อ: file-converter-webapp
    echo 3. เลือก Public
    echo 4. กด Create Repository
    echo.
    
    set /p username="กรอก GitHub username: "
    set repo_url=https://github.com/!username!/file-converter-webapp.git
    
    echo กำลัง Push โค้ด...
    git remote add origin !repo_url! 2>nul
    git remote set-url origin !repo_url!
    git branch -M main
    git push -u origin main
    
    if errorlevel 1 (
        echo ❌ Push ไม่สำเร็จ ตรวจสอบ GitHub repo
        pause
        exit /b 1
    )
    
    echo ✅ Push สำเร็จ!
)

echo.
echo Step 2: Deploy ไปยัง Railway
echo =============================
echo.
echo 🌐 1. ไปที่ https://railway.app
echo 👤 2. กด "Login" แล้วเลือก "GitHub"
echo ➕ 3. กด "New Project"
echo 📁 4. เลือก "Deploy from GitHub repo"
echo 🔗 5. เลือก Repository: file-converter-webapp
echo 🚀 6. Railway จะ auto-detect Node.js และ deploy
echo.

echo ⚙️  Railway จะทำให้อัตโนมัติ:
echo - ติดตั้ง dependencies (npm install)
echo - รัน server (npm start)
echo - สร้าง SSL certificate
echo - ให้ custom domain
echo.

echo 💰 Usage & Pricing:
echo - $5 credit ฟรีทุกเดือน
echo - ประมาณ 550+ ชั่วโมง runtime
echo - เหมาะสำหรับ production use
echo.

echo 🔧 Advanced Features:
echo - Environment Variables
echo - Database ฟรี (PostgreSQL, MySQL, Redis)
echo - Metrics & Monitoring
echo - Custom Domains
echo - Team Collaboration
echo.

echo กำลังเปิดเว็บ Railway สำหรับคุณ...
start https://railway.app

echo.
echo 📊 เปรียบเทียบ Vercel vs Railway:
echo.
echo Vercel (แนะนำ):
echo + ฟรีตลอดชีพ (ไม่มี credit หมด)
echo + เร็วกว่า (CDN Global)
echo + ง่ายกว่า
echo - File upload จำกัด 50MB
echo - ไม่มี Database
echo.
echo Railway (สำหรับ Power Users):
echo + Upload ไฟล์ไม่จำกัด
echo + Database ฟรี
echo + Features เยอะกว่า
echo - ใช้ $5 credit (แต่ถูกมาก)
echo - Setup ซับซ้อนกว่าเล็กน้อย
echo.

echo 💡 คำแนะนำ:
echo - ถ้าใช้งานทั่วไป → เลือก Vercel
echo - ถ้าต้องการ upload ไฟล์ใหญ่ → เลือก Railway
echo - ถ้าต้องการ Database → เลือก Railway
echo.

echo 🔍 หลัง Deploy สำเร็จ:
echo 1. Railway จะให้ URL เช่น: https://your-app.up.railway.app
echo 2. ทดสอบใน deployment-status.html
echo 3. กรอก URL และทดสอบ file conversion
echo.

pause
