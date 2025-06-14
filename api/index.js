const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// กำหนดการอัปโหลดไฟล์ (ใช้ memory storage สำหรับ Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10MB สำหรับ Vercel
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะ PDF, รูปภาพ, และ Text)'), false);
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is working' });
});

// Route หลัก - ส่งหน้า index.html (สำหรับ local development)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API สำหรับแปลงรูปภาพเป็น PDF (ใช้งานได้บน Vercel)
app.post('/image-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์รูปภาพ' });
        }

        const imageBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        
        console.log(`กำลังแปลงรูปภาพ: ${originalName}`);

        // แปลงรูปภาพเป็น PDF
        const processedImage = await sharp(imageBuffer)
            .resize(800, 1000, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const jpgImage = await pdfDoc.embedJpg(processedImage);
        const { width, height } = page.getSize();
        const imgDims = jpgImage.scale(Math.min(width / jpgImage.width, height / jpgImage.height));
        
        page.drawImage(jpgImage, {
            x: (width - imgDims.width) / 2,
            y: (height - imgDims.height) / 2,
            width: imgDims.width,
            height: imgDims.height,
        });
        
        const pdfBytes = await pdfDoc.save();
        const outputFileName = originalName.replace(/\.[^/.]+$/, '.pdf');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outputFileName)}"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Image conversion error:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการแปลงรูปภาพ: ' + error.message 
        });
    }
});

// API สำหรับแปลง Text เป็น PDF
app.post('/text-to-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ text' });
        }

        const textContent = req.file.buffer.toString('utf8');
        const originalName = req.file.originalname;
        
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // แบ่งข้อความเป็นบรรทัด
        const lines = textContent.split('\n');
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        let yPosition = height - 50;
        
        for (const line of lines) {
            if (yPosition < 50) {
                // สร้างหน้าใหม่หากหมดพื้นที่
                const newPage = pdfDoc.addPage();
                yPosition = height - 50;
                newPage.drawText(line, {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    maxWidth: width - 100,
                });
            } else {
                page.drawText(line, {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    maxWidth: width - 100,
                });
            }
            yPosition -= lineHeight;
        }
        
        const pdfBytes = await pdfDoc.save();
        const outputFileName = originalName.replace(/\.[^/.]+$/, '.pdf');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(outputFileName)}"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Text conversion error:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการแปลง text: ' + error.message 
        });
    }
});

// API สำหรับลดขนาด PDF
app.post('/compress-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF' });
        }

        const pdfBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        
        // อ่านไฟล์ PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        // บีบอัดโดยการลดคุณภาพ
        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: false,
            addDefaultPage: false,
        });
        
        const compressedName = originalName.replace('.pdf', '_compressed.pdf');
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(compressedName)}"`);
        res.send(Buffer.from(compressedPdfBytes));

    } catch (error) {
        console.error('Compression error:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการลดขนาดไฟล์: ' + error.message 
        });
    }
});

// API สำหรับรวมไฟล์ PDF
app.post('/merge-pdf', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF อย่างน้อย 2 ไฟล์' });
        }

        const mergedPdf = await PDFDocument.create();
        
        for (const file of req.files) {
            const pdfBuffer = file.buffer;
            const pdf = await PDFDocument.load(pdfBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
        res.send(Buffer.from(mergedPdfBytes));

    } catch (error) {
        console.error('Merge error:', error);
        res.status(500).json({ 
            error: 'เกิดข้อผิดพลาดในการรวมไฟล์: ' + error.message 
        });
    }
});

// Route สำหรับหน้านโยบายความเป็นส่วนตัว
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'เซิร์ฟเวอร์ทำงานปกติ',
        timestamp: new Date().toISOString(),
        features: [
            'รูปภาพเป็น PDF',
            'Text เป็น PDF', 
            'ลดขนาด PDF',
            'รวม PDF'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'ไฟล์มีขนาดใหญ่เกินไป (จำกัด 10MB สำหรับ Vercel)' });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
});

// Export สำหรับ Vercel
module.exports = app;

// สำหรับรัน local
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 เซิร์ฟเวอร์ Vercel-ready กำลังทำงานบนพอร์ต ${PORT}`);
        console.log(`📱 เปิดเบราว์เซอร์และไปที่: http://localhost:${PORT}`);
        console.log(`🔥 ฟีเจอร์ที่รองรับบน Vercel:`);
        console.log(`   - รูปภาพเป็น PDF`);
        console.log(`   - Text เป็น PDF`);
        console.log(`   - ลดขนาด PDF`);
        console.log(`   - รวม PDF`);
    });
}
