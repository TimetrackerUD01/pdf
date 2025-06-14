const multer = require('multer');
const { PDFDocument, rgb } = require('pdf-lib');

// กำหนดการอัปโหลดไฟล์ (ใช้ memory storage สำหรับ Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10MB สำหรับ Vercel
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะไฟล์ .txt)'), false);
        }
    }
});

// Middleware wrapper for multer
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Run multer middleware
        await runMiddleware(req, res, upload.single('file'));

        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ Text' });
        }

        const textBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        const textContent = textBuffer.toString('utf-8');
        
        console.log(`กำลังแปลง Text: ${originalName}`);

        // สร้าง PDF จากข้อความ
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        const fontSize = 14;
        const lineHeight = fontSize * 1.5;
        const maxWidth = width - 100;
        const lines = textContent.split('\n');
        
        let yPosition = height - 50;
        
        for (const line of lines) {
            if (yPosition < 50) {
                // เพิ่มหน้าใหม่ถ้าไม่พอเนื้อที่
                const newPage = pdfDoc.addPage();
                yPosition = height - 50;
                
                newPage.drawText(line, {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                    maxWidth: maxWidth,
                });
            } else {
                page.drawText(line, {
                    x: 50,
                    y: yPosition,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                    maxWidth: maxWidth,
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
            error: 'เกิดข้อผิดพลาดในการแปลง text: ' + error.message        });
    }
};
