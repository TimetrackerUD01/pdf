// Frontend JavaScript for PDF Converter
class PDFConverter {
    constructor() {
        this.init();
    }

    init() {
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        // Create file converter interface
        const converterHTML = `
            <div id="converter-modal" class="converter-modal" style="display: none;">
                <div class="converter-content">
                    <div class="converter-header">
                        <h3 id="converter-title">แปลงไฟล์</h3>
                        <button class="close-btn" onclick="closeConverter()">&times;</button>
                    </div>
                    <div class="converter-body">
                        <div class="file-upload-area" id="file-upload-area">
                            <input type="file" id="file-input" accept="*/*" style="display: none;">
                            <div class="upload-placeholder">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>คลิกหรือลากไฟล์มาวางที่นี่</p>
                                <small>ขนาดไฟล์สูงสุด 10MB</small>
                            </div>
                        </div>
                        <div class="file-info" id="file-info" style="display: none;"></div>
                        <div class="conversion-progress" id="conversion-progress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <p>กำลังแปลงไฟล์...</p>
                        </div>
                        <div class="conversion-result" id="conversion-result" style="display: none;"></div>
                    </div>
                    <div class="converter-footer">
                        <button class="btn-convert" id="btn-convert" onclick="startConversion()" disabled>
                            เริ่มแปลงไฟล์
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', converterHTML);
        this.addConverterStyles();
    }

    addConverterStyles() {
        const styles = `
            <style>
                .converter-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 0.3s ease;
                }

                .converter-content {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(255, 107, 53, 0.3);
                }

                .converter-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 30px;
                    border-bottom: 1px solid #eee;
                    background: linear-gradient(135deg, #ff6b35, #ff8e53);
                    color: white;
                    border-radius: 20px 20px 0 0;
                }

                .converter-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s ease;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .converter-body {
                    padding: 30px;
                }

                .file-upload-area {
                    border: 3px dashed #ff6b35;
                    border-radius: 15px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #fafafa;
                }

                .file-upload-area:hover {
                    border-color: #ff8e53;
                    background: #f5f5f5;
                }

                .file-upload-area.dragover {
                    border-color: #ff8e53;
                    background: #fff5f0;
                    transform: scale(1.02);
                }

                .upload-placeholder i {
                    font-size: 3rem;
                    color: #ff6b35;
                    margin-bottom: 15px;
                }

                .upload-placeholder p {
                    font-size: 1.2rem;
                    color: #333;
                    margin: 10px 0;
                }

                .upload-placeholder small {
                    color: #666;
                }

                .file-info {
                    background: #f8f9fa;
                    border-radius: 10px;
                    padding: 15px;
                    margin: 20px 0;
                }

                .file-info h4 {
                    margin: 0 0 10px 0;
                    color: #ff6b35;
                }

                .progress-bar {
                    width: 100%;
                    height: 10px;
                    background: #eee;
                    border-radius: 5px;
                    overflow: hidden;
                    margin: 20px 0;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(135deg, #ff6b35, #ff8e53);
                    width: 0%;
                    transition: width 0.3s ease;
                    animation: progressPulse 2s infinite;
                }

                @keyframes progressPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .conversion-result {
                    text-align: center;
                    padding: 20px;
                }

                .conversion-result.success {
                    background: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                    border-radius: 10px;
                }

                .conversion-result.error {
                    background: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    border-radius: 10px;
                }

                .converter-footer {
                    padding: 20px 30px;
                    border-top: 1px solid #eee;
                    text-align: center;
                }

                .btn-convert {
                    background: linear-gradient(135deg, #ff6b35, #ff8e53);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 1.1rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                }

                .btn-convert:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.4);
                }

                .btn-convert:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }

                .download-btn {
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 1.1rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 600;
                    margin: 10px;
                }

                .download-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @media (max-width: 768px) {
                    .converter-content {
                        width: 95%;
                        margin: 20px;
                    }
                    
                    .converter-header,
                    .converter-body,
                    .converter-footer {
                        padding: 20px;
                    }
                    
                    .file-upload-area {
                        padding: 30px 15px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    setupEventListeners() {
        // File upload listeners
        const fileUploadArea = document.getElementById('file-upload-area');
        const fileInput = document.getElementById('file-input');

        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop listeners
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files[0]);
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        this.selectedFile = file;
        this.showFileInfo(file);
        document.getElementById('btn-convert').disabled = false;
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('file-info');
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        fileInfo.innerHTML = `
            <h4><i class="fas fa-file"></i> ข้อมูลไฟล์</h4>
            <p><strong>ชื่อไฟล์:</strong> ${file.name}</p>
            <p><strong>ขนาด:</strong> ${fileSize} MB</p>
            <p><strong>ประเภท:</strong> ${file.type || 'ไม่ทราบ'}</p>
        `;
        
        fileInfo.style.display = 'block';
        document.getElementById('file-upload-area').style.display = 'none';
    }

    async startConversion() {
        if (!this.selectedFile || !this.currentConverterType) return;

        this.showProgress();

        const formData = new FormData();
        formData.append('file', this.selectedFile);

        try {
            const response = await fetch(`/api/convert/${this.currentConverterType}`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.message);
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.showError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
    }

    showProgress() {
        document.getElementById('conversion-progress').style.display = 'block';
        document.getElementById('btn-convert').disabled = true;
        
        // Simulate progress animation
        const progressFill = document.querySelector('.progress-fill');
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10;
            if (width >= 90) {
                clearInterval(interval);
                width = 90;
            }
            progressFill.style.width = width + '%';
        }, 200);
    }

    showSuccess(result) {
        document.getElementById('conversion-progress').style.display = 'none';
        const resultDiv = document.getElementById('conversion-result');
        
        resultDiv.className = 'conversion-result success';
        resultDiv.innerHTML = `
            <h4><i class="fas fa-check-circle"></i> แปลงไฟล์สำเร็จ!</h4>
            <p>${result.message}</p>
            <button class="download-btn" onclick="downloadFile('${result.downloadUrl}', '${result.filename}')">
                <i class="fas fa-download"></i> ดาวน์โหลดไฟล์
            </button>
        `;
        
        resultDiv.style.display = 'block';
        
        // Complete progress bar
        document.querySelector('.progress-fill').style.width = '100%';
    }

    showError(message) {
        document.getElementById('conversion-progress').style.display = 'none';
        const resultDiv = document.getElementById('conversion-result');
        
        resultDiv.className = 'conversion-result error';
        resultDiv.innerHTML = `
            <h4><i class="fas fa-exclamation-circle"></i> เกิดข้อผิดพลาด</h4>
            <p>${message}</p>
            <button class="btn-convert" onclick="resetConverter()">
                ลองใหม่อีกครั้ง
            </button>
        `;
        
        resultDiv.style.display = 'block';
        document.getElementById('btn-convert').disabled = false;
    }

    openConverter(type) {
        this.currentConverterType = type;
        
        const titles = {
            'word-to-pdf': 'แปลง Word เป็น PDF',
            'excel-to-pdf': 'แปลง Excel เป็น PDF',
            'ppt-to-pdf': 'แปลง PowerPoint เป็น PDF',
            'pdf-compress': 'ลดขนาด PDF',
            'pdf-merge': 'รวม PDF',
            'pdf-split': 'แยก PDF'
        };
        
        document.getElementById('converter-title').textContent = titles[type] || 'แปลงไฟล์';
        document.getElementById('converter-modal').style.display = 'flex';
        
        // Reset state
        this.resetConverter();
    }

    resetConverter() {
        this.selectedFile = null;
        document.getElementById('file-info').style.display = 'none';
        document.getElementById('file-upload-area').style.display = 'block';
        document.getElementById('conversion-progress').style.display = 'none';
        document.getElementById('conversion-result').style.display = 'none';
        document.getElementById('btn-convert').disabled = true;
        document.getElementById('file-input').value = '';
        document.querySelector('.progress-fill').style.width = '0%';
    }

    closeConverter() {
        document.getElementById('converter-modal').style.display = 'none';
        this.resetConverter();
    }
}

// Global functions
function downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openConverter(type) {
    if (!window.pdfConverter) {
        window.pdfConverter = new PDFConverter();
    }
    window.pdfConverter.openConverter(type);
}

function closeConverter() {
    if (window.pdfConverter) {
        window.pdfConverter.closeConverter();
    }
}

function startConversion() {
    if (window.pdfConverter) {
        window.pdfConverter.startConversion();
    }
}

function resetConverter() {
    if (window.pdfConverter) {
        window.pdfConverter.resetConverter();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.pdfConverter = new PDFConverter();
});
