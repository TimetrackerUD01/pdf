const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root directory
app.use(express.static(__dirname));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = {
            'word-to-pdf': ['.doc', '.docx'],
            'excel-to-pdf': ['.xls', '.xlsx'],
            'ppt-to-pdf': ['.ppt', '.pptx'],
            'pdf-compress': ['.pdf'],
            'pdf-merge': ['.pdf'],
            'pdf-split': ['.pdf']
        };

        const converterType = req.body.converterType || req.query.type;
        const fileExt = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes[converterType] && allowedTypes[converterType].includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('ไฟล์ประเภทนี้ไม่รองรับ'), false);
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for file conversion
app.post('/api/convert/:type', upload.single('file'), async (req, res) => {
    try {
        const converterType = req.params.type;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                success: false, 
                message: 'ไม่พบไฟล์ที่อัพโหลด' 
            });
        }

        console.log(`Converting file: ${file.originalname} (Type: ${converterType})`);

        let outputPath;
        let outputFilename;

        switch (converterType) {
            case 'word-to-pdf':
                outputPath = await convertWordToPdf(file);
                outputFilename = file.originalname.replace(/\.(doc|docx)$/i, '.pdf');
                break;
            
            case 'pdf-compress':
                outputPath = await compressPdf(file);
                outputFilename = file.originalname.replace('.pdf', '_compressed.pdf');
                break;
            
            case 'pdf-merge':
                // For merge, we'll handle multiple files later
                outputPath = await mergePdf([file]);
                outputFilename = 'merged.pdf';
                break;
            
            case 'pdf-split':
                outputPath = await splitPdf(file);
                outputFilename = file.originalname.replace('.pdf', '_split.pdf');
                break;
            
            case 'excel-to-pdf':
                outputPath = await convertExcelToPdf(file);
                outputFilename = file.originalname.replace(/\.(xls|xlsx)$/i, '.pdf');
                break;
            
            case 'ppt-to-pdf':
                outputPath = await convertPptToPdf(file);
                outputFilename = file.originalname.replace(/\.(ppt|pptx)$/i, '.pdf');
                break;
            
            default:
                throw new Error('ประเภทการแปลงไม่รองรับ');
        }

        // Clean up uploaded file
        fs.unlink(file.path).catch(console.error);

        res.json({
            success: true,
            message: 'แปลงไฟล์สำเร็จ',
            downloadUrl: `/api/download/${path.basename(outputPath)}`,
            filename: outputFilename
        });

    } catch (error) {
        console.error('Conversion error:', error);
        
        // Clean up files on error
        if (req.file) {
            fs.unlink(req.file.path).catch(console.error);
        }

        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการแปลงไฟล์'
        });
    }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(outputDir, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false, 
                message: 'ไม่พบไฟล์ที่ต้องการดาวน์โหลด' 
            });
        }

        res.download(filePath, (err) => {
            if (err) {
                console.error('Download error:', err);
            } else {
                // Clean up file after download
                setTimeout(() => {
                    fs.unlink(filePath).catch(console.error);
                }, 60000); // Delete after 1 minute
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดาวน์โหลด'
        });
    }
});

// Conversion functions
async function convertWordToPdf(file) {
    // For now, create a simple PDF with the content
    // In production, you'd use libraries like mammoth.js + puppeteer
    const outputPath = path.join(outputDir, `converted-${Date.now()}.pdf`);
    
    // Create a simple PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    page.drawText(`แปลงจากไฟล์: ${file.originalname}`, {
        x: 50,
        y: height - 100,
        size: 16
    });
    
    page.drawText('เนื้อหาจะถูกแปลงจากไฟล์ Word ต้นฉบับ', {
        x: 50,
        y: height - 150,
        size: 12
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
}

async function compressPdf(file) {
    // Simple PDF compression using pdf-lib
    const inputPdf = await fs.readFile(file.path);
    const pdfDoc = await PDFDocument.load(inputPdf);
    
    // Basic compression by recreating the PDF
    const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
    });
    
    const outputPath = path.join(outputDir, `compressed-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, compressedPdfBytes);
    
    return outputPath;
}

async function mergePdf(files) {
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
        const pdfBytes = await fs.readFile(file.path);
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    const outputPath = path.join(outputDir, `merged-${Date.now()}.pdf`);
    const pdfBytes = await mergedPdf.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
}

async function splitPdf(file) {
    const inputPdf = await fs.readFile(file.path);
    const pdfDoc = await PDFDocument.load(inputPdf);
    
    // For demo, just return the first page
    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    newPdf.addPage(firstPage);
    
    const outputPath = path.join(outputDir, `split-${Date.now()}.pdf`);
    const pdfBytes = await newPdf.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
}

async function convertExcelToPdf(file) {
    // Placeholder for Excel to PDF conversion
    const outputPath = path.join(outputDir, `excel-converted-${Date.now()}.pdf`);
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    page.drawText(`แปลงจากไฟล์ Excel: ${file.originalname}`, {
        x: 50,
        y: height - 100,
        size: 16
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
}

async function convertPptToPdf(file) {
    // Placeholder for PowerPoint to PDF conversion
    const outputPath = path.join(outputDir, `ppt-converted-${Date.now()}.pdf`);
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    page.drawText(`แปลงจากไฟล์ PowerPoint: ${file.originalname}`, {
        x: 50,
        y: height - 100,
        size: 16
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
}

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: error.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
});

// Clean up old files periodically
setInterval(() => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    [uploadsDir, outputDir].forEach(dir => {
        fs.readdir(dir, (err, files) => {
            if (err) return;
            
            files.forEach(file => {
                const filePath = path.join(dir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    
                    if (now - stats.mtime.getTime() > maxAge) {
                        fs.unlink(filePath).catch(console.error);
                    }
                });
            });
        });
    });
}, 30 * 60 * 1000); // Run every 30 minutes

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`🎨 Frontend served from: ${__dirname}`);
});

module.exports = app;
