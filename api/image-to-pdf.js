const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

// กำหนดการอัปโหลดไฟล์ (ใช้ memory storage สำหรับ Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10MB สำหรับ Vercel
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะรูปภาพ JPG, PNG, GIF)'), false);
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
            error: 'เกิดข้อผิดพลาดในการแปลงรูปภาพ: ' + error.message        });
    }
};
