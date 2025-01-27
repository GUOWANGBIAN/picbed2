class ImagePreview {
    constructor() {
        this.previewArea = document.getElementById('previewArea');
        this.gallery = document.getElementById('galleryGrid');
        this.initEventListeners();
    }

    initEventListeners() {
        // 监听图片处理完成事件
        document.addEventListener('imageProcessed', (e) => {
            this.updatePreview(e.detail);
        });

        // 监听图片点击事件
        this.previewArea.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.showImageDetail(e.target);
            }
        });
    }

    // 更新预览
    updatePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = this.createPreviewItem(e.target.result, file);
            this.previewArea.innerHTML = ''; // 清除现有预览
            this.previewArea.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }

    // 创建预览项
    createPreviewItem(src, file) {
        const item = document.createElement('div');
        item.className = 'preview-item';
        item.innerHTML = `
            <img src="${src}" alt="${file.name}">
            <div class="preview-info">
                <p class="filename">${file.name}</p>
                <p class="filesize">${this.formatFileSize(file.size)}</p>
                <p class="dimensions" data-src="${src}">加载中...</p>
            </div>
            <div class="preview-actions">
                <button class="btn-copy">复制</button>
                <button class="btn-delete">删除</button>
            </div>
        `;

        // 获取图片尺寸
        this.loadImageDimensions(src, item.querySelector('.dimensions'));

        // 绑定按钮事件
        this.bindPreviewActions(item, src);

        return item;
    }

    // 加载图片尺寸
    loadImageDimensions(src, element) {
        const img = new Image();
        img.onload = () => {
            element.textContent = `${img.width} × ${img.height}`;
        };
        img.src = src;
    }

    // 绑定预览操作
    bindPreviewActions(item, src) {
        const copyBtn = item.querySelector('.btn-copy');
        const deleteBtn = item.querySelector('.btn-delete');

        copyBtn.onclick = (e) => {
            e.stopPropagation();
            this.copyImageUrl(src);
        };

        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            item.remove();
        };
    }

    // 显示图片详情
    showImageDetail(img) {
        const modal = document.createElement('div');
        modal.className = 'image-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <img src="${img.src}" alt="详情图片">
                <div class="image-info">
                    <p>文件名：${img.alt}</p>
                    <p>尺寸：${img.naturalWidth} × ${img.naturalHeight}</p>
                    <p>类型：${this.getImageType(img.src)}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 关闭模态框
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // 复制图片URL
    copyImageUrl(url) {
        navigator.clipboard.writeText(url)
            .then(() => this.showToast('链接已复制'))
            .catch(() => this.showToast('复制失败'));
    }

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // 获取图片类型
    getImageType(src) {
        const match = src.match(/data:([^;]+);/);
        return match ? match[1] : '未知类型';
    }

    // 更新图片库
    updateGallery(images) {
        this.gallery.innerHTML = '';
        images.forEach(image => {
            const galleryItem = this.createGalleryItem(image);
            this.gallery.appendChild(galleryItem);
        });
    }

    // 创建图片库项
    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${image.url}" alt="${image.name}">
            <div class="gallery-item-info">
                <p>${image.name}</p>
                <p>${this.formatFileSize(image.size)}</p>
                <p>${image.uploadTime}</p>
            </div>
        `;
        return item;
    }
}

// 初始化预览功能
const imagePreview = new ImagePreview(); 