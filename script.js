// Global variables
let currentConverter = '';
let selectedFile = null;

// DOM elements
const modal = document.getElementById('converterModal');
const modalTitle = document.getElementById('modalTitle');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const convertBtn = document.getElementById('convertBtn');

// Converter configurations
const converterConfig = {
    'word-to-pdf': {
        title: 'แปลง Word เป็น PDF',
        accept: '.docx,.doc',
        icon: 'fas fa-file-word'
    },
    'pdf-compress': {
        title: 'ลดขนาดไฟล์ PDF',
        accept: '.pdf',
        icon: 'fas fa-compress-alt'
    },
    'pdf-merge': {
        title: 'รวมไฟล์ PDF',
        accept: '.pdf',
        icon: 'fas fa-object-group'
    },
    'pdf-split': {
        title: 'แยกไฟล์ PDF',
        accept: '.pdf',
        icon: 'fas fa-cut'
    },
    'excel-to-pdf': {
        title: 'แปลง Excel เป็น PDF',
        accept: '.xlsx,.xls',
        icon: 'fas fa-file-excel'
    },
    'ppt-to-pdf': {
        title: 'แปลง PowerPoint เป็น PDF',
        accept: '.pptx,.ppt',
        icon: 'fas fa-file-powerpoint'
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupDragAndDrop();
});

// Setup event listeners
function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Modal close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeConverter();
        }
    });
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

// Setup drag and drop functionality
function setupDragAndDrop() {
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
}

// Prevent default drag behaviors
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area
function highlight(e) {
    uploadArea.classList.add('drag-over');
}

// Remove highlight from drop area
function unhighlight(e) {
    uploadArea.classList.remove('drag-over');
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle file selection
function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// Process selected files
function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            selectedFile = file;
            displayFilePreview(file);
        }
    }
}

// Validate file type and size
function validateFile(file) {
    const config = converterConfig[currentConverter];
    const acceptedTypes = config.accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    // Check file type
    if (!acceptedTypes.includes(fileExtension)) {
        showAlert('ไฟล์ประเภทนี้ไม่รองรับ กรุณาเลือกไฟล์ที่ถูกต้อง', 'error');
        return false;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showAlert('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)', 'error');
        return false;
    }
    
    return true;
}

// Display file preview
function displayFilePreview(file) {
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    uploadArea.style.display = 'none';
    filePreview.style.display = 'block';
    
    // Update file icon based on type
    const fileIcon = filePreview.querySelector('.file-icon i');
    const config = converterConfig[currentConverter];
    fileIcon.className = config.icon;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Open converter modal
function openConverter(type) {
    currentConverter = type;
    const config = converterConfig[type];
    
    modalTitle.textContent = config.title;
    fileInput.accept = config.accept;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    resetForm();
}

// Close converter modal
function closeConverter() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

// Reset form to initial state
function resetForm() {
    selectedFile = null;
    fileInput.value = '';
    uploadArea.style.display = 'block';
    filePreview.style.display = 'none';
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> เริ่มแปลง';
    convertBtn.disabled = false;
}

// Trigger file input
function triggerFileInput() {
    fileInput.click();
}

// Remove selected file
function removeFile() {
    resetForm();
}

// Start conversion process
function startConversion() {
    if (!selectedFile) {
        showAlert('กรุณาเลือกไฟล์ก่อน', 'error');
        return;
    }
    
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังแปลง...';
    convertBtn.disabled = true;
    progressBar.style.display = 'block';
    
    // Real conversion with backend
    performRealConversion();
}

// Perform real conversion with backend
async function performRealConversion() {
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('converterType', currentConverter);

        // Start progress animation
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 300);

        const response = await fetch(`/api/convert/${currentConverter}`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        clearInterval(progressInterval);
        progressFill.style.width = '100%';

        if (result.success) {
            setTimeout(() => {
                completeRealConversion(result.downloadUrl, result.filename);
            }, 500);
        } else {
            throw new Error(result.message);
        }

    } catch (error) {
        console.error('Conversion error:', error);
        progressBar.style.display = 'none';
        convertBtn.innerHTML = '<i class="fas fa-sync-alt"></i> เริ่มแปลง';
        convertBtn.disabled = false;
        showAlert('เกิดข้อผิดพลาด: ' + error.message, 'error');
    }
}

// Complete real conversion and setup download
function completeRealConversion(downloadUrl, filename) {
    convertBtn.innerHTML = '<i class="fas fa-download"></i> ดาวน์โหลด';
    convertBtn.onclick = () => downloadRealFile(downloadUrl, filename);
    
    showAlert('แปลงไฟล์สำเร็จ! คลิกดาวน์โหลดเพื่อบันทึกไฟล์', 'success');
}

// Download real converted file
function downloadRealFile(downloadUrl, filename) {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showAlert('ไฟล์ได้ถูกดาวน์โหลดเรียบร้อยแล้ว', 'success');
    
    // Close modal after download
    setTimeout(() => {
        closeConverter();
    }, 1500);
}

// Complete conversion and download (legacy - keep for fallback)
function completeConversion() {
    convertBtn.innerHTML = '<i class="fas fa-download"></i> ดาวน์โหลด';
    convertBtn.onclick = downloadFile;
    
    showAlert('แปลงไฟล์สำเร็จ! คลิกดาวน์โหลดเพื่อบันทึกไฟล์', 'success');
}

// Download converted file (legacy simulation - keep for fallback)
function downloadFile() {
    const originalName = selectedFile.name.split('.')[0];
    let newExtension = 'pdf';
    
    // Determine output extension based on converter type
    if (currentConverter === 'pdf-compress' || 
        currentConverter === 'pdf-merge' || 
        currentConverter === 'pdf-split') {
        newExtension = 'pdf';
    }
    
    const outputFileName = `${originalName}_converted.${newExtension}`;
    
    // Create a dummy file for download simulation
    const blob = new Blob(['This is a simulated converted file.'], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success message
    showAlert('ไฟล์ได้ถูกดาวน์โหลดเรียบร้อยแล้ว', 'success');
    
    // Close modal after download
    setTimeout(() => {
        closeConverter();
    }, 1500);
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              'info-circle'}"></i>
            <span>${message}</span>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add alert styles if not already added
    if (!document.querySelector('#alert-styles')) {
        const alertStyles = document.createElement('style');
        alertStyles.id = 'alert-styles';
        alertStyles.textContent = `
            .alert {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                padding: 1rem;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                animation: slideInRight 0.3s ease;
            }
            
            .alert-success {
                background: linear-gradient(135deg, #00c851, #00a444);
                color: white;
            }
            
            .alert-error {
                background: linear-gradient(135deg, #ff4444, #cc0000);
                color: white;
            }
            
            .alert-info {
                background: linear-gradient(135deg, #33b5e5, #0099cc);
                color: white;
            }
            
            .alert-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .alert-content i {
                font-size: 1.2rem;
            }
            
            .alert-content span {
                flex: 1;
                font-weight: 500;
            }
            
            .alert-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .alert-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(alertStyles);
    }
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Smooth scroll to services section
function scrollToServices() {
    document.getElementById('services').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate service cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe service cards
    document.querySelectorAll('.service-card').forEach(card => {
        observer.observe(card);
    });
    
    // Observe feature items
    document.querySelectorAll('.feature-item').forEach(item => {
        observer.observe(item);
    });
});

// Add fadeInUp animation
const fadeInUpStyle = document.createElement('style');
fadeInUpStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .service-card,
    .feature-item {
        opacity: 0;
    }
`;
document.head.appendChild(fadeInUpStyle);
