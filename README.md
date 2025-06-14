# 🚀 เครื่องมือแปลงไฟล์ออนไลน์

เว็บไซต์แปลงไฟล์ออนไลน์ฟรี รองรับ Render Cloud Platform

## ✨ ฟีเจอร์ที่รองรับ

- 🖼️ **รูปภาพ → PDF** (.jpg, .png, .gif)
- 📝 **Text → PDF** (.txt)
- 🗜️ **ลดขนาด PDF**
- 📋 **รวม PDF หลายไฟล์**
- 💰 **Google AdSense** (ca-pub-1797172064583364)
- 📊 **Google Analytics**
- 🔄 **Keep-Alive System** (ไม่ sleep บน Render)

## 📦 การติดตั้ง

```bash
npm install
npm start
```

## 🚀 Deploy บน Render (แนะนำ)

1. Push โค้ดไป GitHub
2. เข้า [render.com](https://render.com/)
3. Create New → Web Service
4. Connect Repository: `https://github.com/TimetrackerUD01/pdf.git`
5. ตั้งค่า:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (750 ชั่วโมง/เดือน)

## 📁 โครงสร้างโปรเจกต์

```
├── api/
│   └── index.js          # Express server + API endpoints
├── public/
│   ├── index.html        # หน้าเว็บหลัก
│   └── privacy.html      # หน้านโยบาย
├── utils/
│   └── keepAlive.js      # Keep-alive service สำหรับ Render
├── package.json          # Dependencies
├── render.yaml           # Render deployment config
└── README.md
```

## 🔗 API Endpoints

- `GET /api/health` - Health check
- `POST /api/image-to-pdf` - แปลงรูปภาพ
- `POST /api/text-to-pdf` - แปลง Text
- `POST /api/compress-pdf` - ลดขนาด PDF
- `POST /api/merge-pdf` - รวม PDF

## 🎯 ข้อดีของ Render

- ✅ **ฟรีตลอดชีพ** (750 ชั่วโมง/เดือน)
- ✅ **ไฟล์ใหญ่ได้ 50MB** (vs Vercel 10MB)
- ✅ **Keep-Alive อัตโนมัติ** (ไม่ sleep)
- ✅ **รองรับ Node.js เต็มรูปแบบ**

## ⚠️ การใช้งาน

- 📏 ขนาดไฟล์สูงสุด 50MB
- ⏱️ Timeout 30 วินาที
- 🔄 Auto Keep-Alive ทุก 14 นาที

## 📞 ติดต่อ

- Email: timetrackerud01@gmail.com
- GitHub: https://github.com/TimetrackerUD01/pdf.git
- Live Demo: https://pdf-converter-thailand.onrender.com

---

⭐ Made in Thailand | ใช้งานฟรีตลอดชีพ | ปลอดภัย 100% | Keep-Alive 24/7
