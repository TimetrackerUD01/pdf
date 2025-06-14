@echo off
echo ========================================
echo   Deploy ไปยัง Vercel (แนะนำ #1)
echo ========================================
echo.

echo ✅ ทำไมต้อง Vercel?
echo - ฟรีตลอดชีพ (ไม่มี Credit หมด)
echo - ไม่ Sleep (พร้อมใช้ 24/7)
echo - เร็วมาก (CDN ทั่วโลก)
echo - รองรับ File Upload 50MB
echo - Custom Domain ฟรี
echo.

echo 📋 ขั้นตอนง่ายๆ:
echo.

echo Step 1: สร้าง GitHub Repository
echo --------------------------------
echo 1. ไปที่ https://github.com/new
echo 2. ชื่อ Repository: file-converter-webapp
echo 3. เลือก Public
echo 4. ไม่ต้อง initialize อะไร
echo 5. กด Create Repository
echo.

set /p username="🔸 กรอก GitHub username ของคุณ: "
if "%username%"=="" (
    echo ❌ กรุณากรอก username
    pause
    exit /b 1
)

set repo_url=https://github.com/%username%/file-converter-webapp.git
echo.
echo 📤 กำลัง Push โค้ดไปยัง GitHub...
echo Repository: %repo_url%
echo.

git remote add origin %repo_url% 2>nul
if errorlevel 1 (
    echo 🔄 Remote มีอยู่แล้ว กำลัง update URL...
    git remote set-url origin %repo_url%
)

git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Push ไม่สำเร็จ กรุณาตรวจสอบ:
    echo 1. สร้าง Repository บน GitHub แล้วหรือยัง?
    echo 2. ชื่อ username ถูกต้องหรือไม่?
    echo 3. เข้าสู่ระบบ Git แล้วหรือยัง?
    echo.
    echo 💡 หากยังไม่ได้เข้าสู่ระบบ ให้รัน:
    echo    git config --global user.name "ชื่อของคุณ"
    echo    git config --global user.email "email@example.com"
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ สำเร็จ! โค้ดอัพโลดไปยัง GitHub แล้ว
echo 🔗 Repository: %repo_url%
echo.

echo Step 2: Deploy ไปยัง Vercel
echo =============================
echo.
echo 🌐 1. ไปที่ https://vercel.com
echo 👤 2. กด "Sign up" แล้วเลือก "Continue with GitHub"
echo ➕ 3. กด "New Project"
echo 📁 4. เลือก Repository: file-converter-webapp
echo 🚀 5. กด "Deploy" (Vercel จะจัดการทุกอย่างเอง!)
echo.
echo ⏱️  รอ 1-2 นาที Vercel จะ build และ deploy ให้
echo 🎉 จะได้ URL เช่น: https://file-converter-webapp.vercel.app
echo.

echo 💡 เทคนิคเพิ่มเติม:
echo - เปลี่ยน domain: Settings → Domains
echo - ดู logs: Functions → View Details
echo - อัพเดท: แค่ push ไปยัง GitHub อีกครั้ง
echo.

echo กำลังเปิดเว็บ Vercel สำหรับคุณ...
start https://vercel.com/new

echo.
echo 🔍 หากต้องการตรวจสอบสถานะ:
echo - เปิดไฟล์: deployment-status.html
echo - กรอก URL ที่ได้จาก Vercel
echo - ทดสอบการทำงาน
echo.

pause
