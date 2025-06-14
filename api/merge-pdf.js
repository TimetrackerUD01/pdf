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
        // Run multer middleware for multiple files
        await runMiddleware(req, res, upload.array('files', 10));

        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์ PDF อย่างน้อย 2 ไฟล์' });
        }

        console.log(`กำลังรวม PDF: ${req.files.length} ไฟล์`);

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
            error: 'เกิดข้อผิดพลาดในการรวมไฟล์: ' + error.message        });
    }
};
