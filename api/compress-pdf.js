const multer = require('multer');
const { PDFDocument } = require('pdf-lib');

// กำหนดการอัปโหลดไฟล์ (ใช้ memory storage สำหรับ Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10MB สำหรับ Vercel
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะไฟล์ PDF)'), false);
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
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF' });
        }

        const pdfBuffer = req.file.buffer;
        const originalName = req.file.originalname;
        
        console.log(`กำลังบีบอัด PDF: ${originalName}`);

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
            error: 'เกิดข้อผิดพลาดในการลดขนาดไฟล์: ' + error.message        });
    }
};
