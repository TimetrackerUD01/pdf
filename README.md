# 🚀 เครื่องมือแปลงไฟล์ออนไลน์

เว็บไซต์แปลงไฟล์ออนไลน์ฟรี รองรับ Vercel Serverless Platform

## ✨ ฟีเจอร์ที่รองรับ

- 🖼️ **รูปภาพ → PDF** (.jpg, .png, .gif)
- 📝 **Text → PDF** (.txt)
- 🗜️ **ลดขนาด PDF**
- 📋 **รวม PDF หลายไฟล์**
- 💰 **Google AdSense** (ca-pub-1797172064583364)
- 📊 **Google Analytics**

## 📦 การติดตั้ง

```bash
npm install
npm start
```

## 🚀 Deploy บน Vercel

1. Push โค้ดไป GitHub
2. เข้า [vercel.com](https://vercel.com/)
3. Import Project และ Deploy

## 📁 โครงสร้างโปรเจกต์

```
├── api/
│   └── index.js          # Serverless functions
├── public/
│   ├── index.html        # หน้าเว็บหลัก
│   └── privacy.html      # หน้านโยบาย
├── package.json          # Dependencies
├── vercel.json           # Vercel config
└── README.md
```

## 🔗 API Endpoints

- `GET /api/health` - Health check
- `POST /api/image-to-pdf` - แปลงรูปภาพ
- `POST /api/text-to-pdf` - แปลง Text
- `POST /api/compress-pdf` - ลดขนาด PDF
- `POST /api/merge-pdf` - รวม PDF

## ⚠️ ข้อจำกัดบน Vercel

- ❌ Word/Excel/PowerPoint → PDF (ต้องใช้ LibreOffice)
- 📏 ขนาดไฟล์สูงสุด 10MB
- ⏱️ Timeout 30 วินาที

## 📞 ติดต่อ

- Email: timetrackerud01@gmail.com
- Website: https://pdf-to-word-one.vercel.app

---

⭐ Made in Thailand | ใช้งานฟรี | ปลอดภัย 100%
