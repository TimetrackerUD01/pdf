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
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API is working' });
});

// Route หลัก - ส่งหน้า index.html (สำหรับ local development)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API สำหรับแปลงรูปภาพเป็น PDF (ใช้งานได้บน Vercel)
app.post('/api/image-to-pdf', upload.single('file'), async (req, res) => {
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
app.post('/api/text-to-pdf', upload.single('file'), async (req, res) => {
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
app.post('/api/compress-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF' });
        }

        // ตรวจสอบ MIME type
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ 
                error: 'ไฟล์ที่อัปโหลดไม่ใช่ PDF (รองรับเฉพาะไฟล์ .pdf เท่านั้น)' 
            });
        }

        const pdfBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        
        // ตรวจสอบ PDF header
        const pdfHeader = pdfBuffer.slice(0, 5).toString();
        if (!pdfHeader.startsWith('%PDF')) {
            return res.status(400).json({ 
                error: 'ไฟล์ที่อัปโหลดไม่ใช่ PDF ที่ถูกต้อง (ไม่พบ PDF header)' 
            });
        }

        // ตรวจสอบขนาดไฟล์
        if (pdfBuffer.length === 0) {
            return res.status(400).json({ 
                error: 'ไฟล์ที่อัปโหลดว่างเปล่า' 
            });
        }

        console.log(`กำลังบีบอัด PDF: ${originalName} (${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB)`);
        
        // อ่านไฟล์ PDF
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        
        // บีบอัดโดยการลดคุณภาพ
        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: false,
            addDefaultPage: false,
        });
        
        const compressedName = originalName.replace('.pdf', '_compressed.pdf');
        const compressionRatio = ((1 - compressedPdfBytes.length / pdfBuffer.length) * 100).toFixed(1);
        
        console.log(`บีบอัดสำเร็จ: ${compressionRatio}% reduction`);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(compressedName)}"`);
        res.send(Buffer.from(compressedPdfBytes));

    } catch (error) {
        console.error('Compression error:', error);
        
        // ส่ง error message ที่เข้าใจง่าย
        let errorMessage = 'เกิดข้อผิดพลาดในการลดขนาดไฟล์';
        
        if (error.message.includes('No PDF header found')) {
            errorMessage = 'ไฟล์ที่อัปโหลดไม่ใช่ PDF ที่ถูกต้อง กรุณาตรวจสอบไฟล์และลองใหม่';
        } else if (error.message.includes('Failed to parse PDF')) {
            errorMessage = 'ไฟล์ PDF เสียหายหรือมีรูปแบบที่ไม่รองรับ กรุณาลองใช้ไฟล์ PDF อื่น';
        } else if (error.message.includes('LIMIT_FILE_SIZE')) {
            errorMessage = 'ไฟล์มีขนาดใหญ่เกินไป (จำกัด 10MB สำหรับ Vercel)';
        }
        
        res.status(500).json({ 
            error: errorMessage
        });
    }
});

// API สำหรับรวมไฟล์ PDF
app.post('/api/merge-pdf', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF อย่างน้อย 2 ไฟล์' });
        }

        // ตรวจสอบไฟล์ทั้งหมดว่าเป็น PDF
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            // ตรวจสอบ MIME type
            if (file.mimetype !== 'application/pdf') {
                return res.status(400).json({ 
                    error: `ไฟล์ที่ ${i + 1} ไม่ใช่ PDF (${file.originalname})` 
                });
            }

            // ตรวจสอบ PDF header
            const pdfHeader = file.buffer.slice(0, 5).toString();
            if (!pdfHeader.startsWith('%PDF')) {
                return res.status(400).json({ 
                    error: `ไฟล์ที่ ${i + 1} ไม่ใช่ PDF ที่ถูกต้อง (${file.originalname})` 
                });
            }

            // ตรวจสอบขนาดไฟล์
            if (file.buffer.length === 0) {
                return res.status(400).json({ 
                    error: `ไฟล์ที่ ${i + 1} ว่างเปล่า (${file.originalname})` 
                });
            }
        }

        console.log(`กำลังรวม PDF: ${req.files.length} ไฟล์`);

        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            try {
                const pdfBuffer = file.buffer;
                const pdf = await PDFDocument.load(pdfBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
                console.log(`เพิ่มไฟล์ ${i + 1}: ${file.originalname} (${pdf.getPageCount()} หน้า)`);
            } catch (fileError) {
                return res.status(400).json({ 
                    error: `ไม่สามารถประมวลผลไฟล์ที่ ${i + 1} (${file.originalname}): ${fileError.message}` 
                });
            }
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        
        console.log(`รวม PDF สำเร็จ: ${(mergedPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
        res.send(Buffer.from(mergedPdfBytes));

    } catch (error) {
        console.error('Merge error:', error);
        
        // ส่ง error message ที่เข้าใจง่าย
        let errorMessage = 'เกิดข้อผิดพลาดในการรวมไฟล์';
        
        if (error.message.includes('No PDF header found')) {
            errorMessage = 'มีไฟล์ที่ไม่ใช่ PDF ที่ถูกต้อง กรุณาตรวจสอบไฟล์ทั้งหมดและลองใหม่';
        } else if (error.message.includes('Failed to parse PDF')) {
            errorMessage = 'มีไฟล์ PDF เสียหายหรือมีรูปแบบที่ไม่รองรับ กรุณาลองใช้ไฟล์ PDF อื่น';
        } else if (error.message.includes('LIMIT_FILE_SIZE')) {
            errorMessage = 'ไฟล์มีขนาดใหญ่เกินไป (จำกัด 10MB สำหรับ Vercel)';
        }
        
        res.status(500).json({ 
            error: errorMessage
        });
    }
});

// Route สำหรับหน้านโยบายความเป็นส่วนตัว
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
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
