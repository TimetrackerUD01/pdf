# 🚀 เครื่องมือแปลงไฟล์ออนไลน์

> **✨ เว็บแปลงไฟล์ PDF ออนไลน์ที่ทันสมัย พร้อม Google AdSense**
> 
> **🎯 Deployed on Koyeb** - ไม่มีข้อจำกัด, ประสิทธิภาพสูง!

## 🌟 ฟีเจอร์หลัก

- 🖼️ **แปลงรูปภาพเป็น PDF** - JPG, PNG, GIF (up to 50MB)
- 📝 **แปลง Text เป็น PDF** - ไฟล์ .txt ทุกขนาด
- 🗜️ **ลดขนาด PDF** - บีบอัดอัจฉริยะ
- 📋 **รวม PDF** - รวมหลายไฟล์เป็นหนึ่งเดียว
- 💰 **Google AdSense** - Monetization พร้อมใช้
- 📱 **Responsive Design** - เหมาะกับทุกหน้าจอ

## 🚀 Koyeb Deployment

### ข้อดีของ Koyeb:
- ✅ **No Timeout Limits** - ประมวลผลได้นานไม่จำกัด
- ✅ **50MB File Support** - ไฟล์ใหญ่กว่า Vercel 5 เท่า
- ✅ **Persistent Containers** - ไม่มี cold start
- ✅ **Better Performance** - เร็วและเสถียร
- ✅ **Cost Effective** - $5.50 credit/month ฟรี

### 📋 ขั้นตอนการ Deploy:

1. **สร้างบัญชี Koyeb**
   ```
   https://app.koyeb.com/
   ```

2. **เชื่อมต่อ GitHub Repository**
   ```
   Repository: github.com/TimetrackerUD01/pdf
   Branch: main
   ```

3. **กำหนดการตั้งค่า**
   ```yaml
   Build: Dockerfile
   Port: 3000
   Instance: nano (512MB RAM)
   Environment: NODE_ENV=production
   ```

4. **Deploy & Go Live!**
   ```
   Health Check: /api/health
   Domain: your-app.koyeb.app
   ```

## 🔗 API Endpoints

| Method | Endpoint | Description | File Limit |
|--------|----------|-------------|------------|
| GET | `/api/health` | Health check | - |
| POST | `/api/image-to-pdf` | แปลงรูปภาพ | 50MB |
| POST | `/api/text-to-pdf` | แปลง Text | 50MB |
| POST | `/api/compress-pdf` | ลดขนาด PDF | 50MB |
| POST | `/api/merge-pdf` | รวม PDF | 50MB |

## 📁 โครงสร้างโปรเจกต์

```
├── Dockerfile            # Koyeb container config
├── koyeb.yaml           # Koyeb deployment config
├── api/
│   └── index.js         # Main API server
├── public/
│   ├── index.html       # หน้าเว็บหลัก
│   └── privacy.html     # หน้านโยบาย
├── package.json         # Dependencies
└── README.md
```

## 🛠️ การติดตั้งและรัน Local

```bash
# Clone repository
git clone https://github.com/TimetrackerUD01/pdf.git
cd pdf

# Install dependencies
npm install

# Run development server
npm start

# Access locally
http://localhost:3000
```

## 🎨 UI Features

- **🌙 Modern Dark Theme** - สวยงามและทันสมัย
- **🎯 Full-Screen Layout** - เหมาะกับ PC และ Desktop
- **⚡ Smooth Animations** - การเคลื่อนไหวที่ลื่นไหล
- **📱 Mobile Responsive** - รองรับทุกขนาดหน้าจอ
- **🎪 Progress Indicators** - แสดงสถานะการประมวลผล

## 💰 Google AdSense Integration

- **Publisher ID**: `ca-pub-1797172064583364`
- **Ad Units**: Banner, Square, Responsive
- **Optimized Placement** - วางตำแหน่งโฆษณาเหมาะสม
- **Revenue Ready** - พร้อมสร้างรายได้

## 🔧 Tech Stack

**Backend:**
- Node.js + Express.js
- pdf-lib (PDF processing)
- Sharp (Image processing)
- Multer (File upload)

**Frontend:**
- HTML5 + CSS3 + JavaScript
- Font Awesome Icons
- Google Fonts (Prompt)
- Responsive Grid Layout

**Deployment:**
- **Koyeb** (Main platform)
- Docker containerization
- GitHub integration
- Automatic CI/CD

## 🌍 Environment Comparison

| Platform | File Limit | Timeout | Cold Start | Cost |
|----------|------------|---------|------------|------|
| **Koyeb** | **50MB** | **None** | **No** | **$5.50/mo** |
| Vercel | 10MB | 30s | Yes | $20/mo |
| Heroku | 30MB | 30s | Yes | $7/mo |

## 📞 Contact & Support

- **Developer**: TimetrackerUD01
- **Email**: timetrackerud01@gmail.com
- **Repository**: [GitHub](https://github.com/TimetrackerUD01/pdf)
- **Issues**: [GitHub Issues](https://github.com/TimetrackerUD01/pdf/issues)

---

**🎉 Powered by Koyeb - สำหรับประสิทธิภาพสูงสุดและไม่มีข้อจำกัด!**
