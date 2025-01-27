class ImageUploader {
    constructor() {
        this.config = {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            maxWidth: 1920,
            compressQuality: 0.8
        };
        
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.previewArea = document.getElementById('previewArea');
        this.progressBar = document.getElementById('progressBar');
    }

    bindEvents() {
        // 点击上传
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // 拖拽上传
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // 粘贴上传
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    this.handleFiles([file]);
                }
            }
        });
    }

    async handleFiles(files) {
        for (let file of files) {
            // 验证文件
            if (!this.validateFile(file)) continue;

            // 处理图片
            const processedFile = await this.processImage(file);
            
            // 预览图片
            this.previewImage(processedFile);

            // 上传图片
            await this.uploadImage(processedFile);
        }
    }

    validateFile(file) {
        if (!this.config.allowedTypes.includes(file.type)) {
            alert('不支持的文件类型');
            return false;
        }

        if (file.size > this.config.maxSize) {
            alert('文件大小超过限制');
            return false;
        }

        return true;
    }

    async processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // 处理图片尺寸
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > this.config.maxWidth) {
                        height = (this.config.maxWidth * height) / width;
                        width = this.config.maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    }, 'image/jpeg', this.config.compressQuality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <div class="preview-info">
                    <p>${file.name}</p>
                    <p>${(file.size / 1024).toFixed(2)} KB</p>
                </div>
            `;
            this.previewArea.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('上传失败');

            const result = await response.json();
            this.handleUploadSuccess(result);
        } catch (error) {
            this.handleUploadError(error);
        }
    }

    updateProgress(progress) {
        this.progressBar.style.width = `${progress}%`;
    }

    handleUploadSuccess(result) {
        // 处理上传成功
        console.log('上传成功:', result);
    }

    handleUploadError(error) {
        // 处理上传错误
        console.error('上传失败:', error);
    }
}

// 初始化上传器
new ImageUploader(); 