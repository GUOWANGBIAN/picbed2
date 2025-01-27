class ImageProcessor {
    constructor() {
        this.currentImage = null;
        this.cropper = null;
        this.initTools();
    }

    initTools() {
        const tools = document.getElementById('imageTools');
        tools.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const tool = e.target.dataset.tool;
                this[tool]?.();
            }
        });
    }

    // 图片压缩
    async compress() {
        if (!this.currentImage) return;
        
        try {
            const compressor = new Compressor(this.currentImage, {
                quality: 0.6,
                maxWidth: 1920,
                success: (result) => {
                    this.updateImage(result);
                },
                error: (err) => {
                    console.error('压缩失败:', err);
                }
            });
        } catch (error) {
            console.error('压缩出错:', error);
        }
    }

    // 图片裁剪
    crop() {
        if (!this.currentImage) return;

        const image = document.createElement('img');
        image.src = URL.createObjectURL(this.currentImage);
        
        const cropperContainer = document.createElement('div');
        cropperContainer.className = 'cropper-container';
        cropperContainer.appendChild(image);
        
        document.body.appendChild(cropperContainer);

        this.cropper = new Cropper(image, {
            aspectRatio: NaN,
            viewMode: 1,
            dragMode: 'move',
            ready: () => {
                // 添加确认和取消按钮
                const actions = document.createElement('div');
                actions.className = 'cropper-actions';
                actions.innerHTML = `
                    <button id="cropConfirm">确认</button>
                    <button id="cropCancel">取消</button>
                `;
                cropperContainer.appendChild(actions);

                document.getElementById('cropConfirm').onclick = () => {
                    this.cropper.getCroppedCanvas().toBlob((blob) => {
                        this.updateImage(new File([blob], this.currentImage.name));
                        this.closeCropper();
                    });
                };

                document.getElementById('cropCancel').onclick = () => {
                    this.closeCropper();
                };
            }
        });
    }

    // 图片旋转
    rotate() {
        if (!this.currentImage) return;
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.height;
            canvas.height = img.width;
            
            ctx.translate(canvas.width/2, canvas.height/2);
            ctx.rotate(90 * Math.PI/180);
            ctx.drawImage(img, -img.width/2, -img.height/2);
            
            canvas.toBlob((blob) => {
                this.updateImage(new File([blob], this.currentImage.name));
            });
        };
        
        img.src = URL.createObjectURL(this.currentImage);
    }

    // 添加水印
    async watermark() {
        if (!this.currentImage) return;

        const watermarkText = prompt('请输入水印文字:', '');
        if (!watermarkText) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制原图
            ctx.drawImage(img, 0, 0);
            
            // 添加水印
            ctx.font = '24px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.rotate(-45 * Math.PI / 180);
            ctx.fillText(watermarkText, -img.height/2, img.width/2);
            
            canvas.toBlob((blob) => {
                this.updateImage(new File([blob], this.currentImage.name));
            });
        };

        img.src = URL.createObjectURL(this.currentImage);
    }

    // 格式转换
    convert() {
        if (!this.currentImage) return;

        const formats = ['image/jpeg', 'image/png', 'image/webp'];
        const format = prompt('请选择格式 (jpeg/png/webp):', 'jpeg');
        
        if (!format) return;
        
        const mimeType = `image/${format.toLowerCase()}`;
        if (!formats.includes(mimeType)) {
            alert('不支持的格式');
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                const newName = this.currentImage.name.replace(/\.[^/.]+$/, `.${format}`);
                this.updateImage(new File([blob], newName, { type: mimeType }));
            }, mimeType);
        };

        img.src = URL.createObjectURL(this.currentImage);
    }

    // 调整尺寸
    resize() {
        if (!this.currentImage) return;

        const width = prompt('请输入新的宽度:', '800');
        if (!width || isNaN(width)) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            const ratio = img.height / img.width;
            const newWidth = parseInt(width);
            const newHeight = Math.round(newWidth * ratio);

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob((blob) => {
                this.updateImage(new File([blob], this.currentImage.name));
            });
        };

        img.src = URL.createObjectURL(this.currentImage);
    }

    // 更新图片
    updateImage(newImage) {
        this.currentImage = newImage;
        // 触发预览更新
        const event = new CustomEvent('imageProcessed', { detail: newImage });
        document.dispatchEvent(event);
    }

    // 关闭裁剪器
    closeCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
            document.querySelector('.cropper-container')?.remove();
        }
    }

    // 设置当前图片
    setImage(image) {
        this.currentImage = image;
    }
}

// 初始化图片处理器
const imageProcessor = new ImageProcessor(); 