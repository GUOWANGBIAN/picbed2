class SecurityManager {
    constructor() {
        this.config = {
            maxFileSize: 5 * 3840 * 2160, // 5MB
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            maxWidth: 4096,
            maxHeight: 4096,
            maxFilesPerUpload: 10,
            sensitiveCheck: true
        };

        this.initSecurityChecks();
    }

    // 初始化安全检查
    initSecurityChecks() {
        // 监听文件上传事件
        document.addEventListener('beforeUpload', (e) => {
            const files = e.detail;
            if (!this.validateFiles(files)) {
                e.preventDefault();
            }
        });
    }

    // 验证文件
    validateFiles(files) {
        if (files.length > this.config.maxFilesPerUpload) {
            this.showError(`一次最多上传 ${this.config.maxFilesPerUpload} 个文件`);
            return false;
        }

        for (let file of files) {
            if (!this.validateSingleFile(file)) {
                return false;
            }
        }

        return true;
    }

    // 验证单个文件
    validateSingleFile(file) {
        // 检查文件类型
        if (!this.config.allowedTypes.includes(file.type)) {
            this.showError('不支持的文件类型');
            return false;
        }

        // 检查文件大小
        if (file.size > this.config.maxFileSize) {
            this.showError(`文件大小超过限制（最大 ${this.config.maxFileSize / 1024 / 1024}MB）`);
            return false;
        }

        return true;
    }

    // 检查图片尺寸
    async checkImageDimensions(file) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width > this.config.maxWidth || img.height > this.config.maxHeight) {
                    this.showError(`图片尺寸超过限制（最大 ${this.config.maxWidth}x${this.config.maxHeight}）`);
                    resolve(false);
                }
                resolve(true);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    // 检查敏感内容
    async checkSensitiveContent(file) {
        if (!this.config.sensitiveCheck) return true;

        // 这里应该调用实际的图片审核API
        // 示例使用模拟检查
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }

    // 生成防盗链URL
    generateHotlinkProtectedUrl(url, expireTime = 3600) {
        const timestamp = Math.floor(Date.now() / 1000) + expireTime;
        const token = this.generateToken(url, timestamp);
        return `${url}?token=${token}&expires=${timestamp}`;
    }

    // 生成防盗链Token
    generateToken(url, timestamp) {
        // 实际应用中应使用更安全的方式生成token
        return btoa(`${url}${timestamp}`);
    }

    // 验证URL
    validateUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // 清理文件名
    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    // 生成安全的文件名
    generateSafeFilename(originalFilename) {
        const ext = originalFilename.split('.').pop();
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        return `${timestamp}_${randomString}.${ext}`;
    }

    // 检查文件内容类型
    async checkFileContentType(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = (e) => {
                const arr = new Uint8Array(e.target.result).subarray(0, 4);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }

                let isValid = false;
                // 检查文件头
                switch (header) {
                    case '89504e47': // PNG
                    case 'ffd8ffe0': // JPEG
                    case '47494638': // GIF
                        isValid = true;
                        break;
                }

                resolve(isValid);
            };
            reader.readAsArrayBuffer(file.slice(0, 4));
        });
    }

    // 显示错误信息
    showError(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        document.body.appendChild(error);
        setTimeout(() => error.remove(), 3000);
    }

    // 更新安全配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// 初始化安全管理器
const securityManager = new SecurityManager(); 