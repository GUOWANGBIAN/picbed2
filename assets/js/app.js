class ImageGallery {
    constructor() {
        this.imagesPerPage = 29;
        this.currentPage = 1;
        this.totalPages = 1; // 将根据实际图片数量计算
        this.imageGrid = document.getElementById('imageGrid');
        this.pagination = document.getElementById('pagination');
        
        this.init();
    }

    init() {
        this.setupImglocEvents();
        this.loadImages(this.currentPage);
        this.setupPagination();
    }

    setupImglocEvents() {
        window.addEventListener('pupComplete', (e) => {
            const imageUrl = e.detail.url;
            // 生成两种格式的链接
            const imgTag = `<img src="${imageUrl}" alt="image" border="0" />`;
            const linkTag = `<a href="${imageUrl.replace('i.imgs.ovh', 'imgloc.com/image')}">${imgTag}</a>`;
            
            // 添加到剪贴板
            navigator.clipboard.writeText(linkTag);
            
            // 刷新图片列表
            this.loadImages(1);
        });
    }

    async loadImages(page) {
        // 这里应该是从后端获取图片列表的逻辑
        // 示例数据结构
        const images = await this.fetchImages(page);
        this.renderImages(images);
    }

    renderImages(images) {
        this.imageGrid.innerHTML = '';
        
        // 创建图片行
        for (let i = 0; i < images.length; i += 3) {
            const row = document.createElement('div');
            row.className = 'image-row';
            
            // 添加这一行的图片
            for (let j = 0; j < 3 && i + j < images.length; j++) {
                const image = images[i + j];
                const imageItem = this.createImageItem(image);
                row.appendChild(imageItem);
            }
            
            this.imageGrid.appendChild(row);
        }
    }

    createImageItem(image) {
        const item = document.createElement('div');
        item.className = 'image-item';
        
        // 最后一个位置显示下一页链接
        if (image.isLastItem) {
            item.innerHTML = `
                <a href="?page=${this.currentPage + 1}">
                    <img src="${image.url}" alt="下一页">
                    <div class="image-links">下一页</div>
                </a>
            `;
        } else {
            item.innerHTML = `
                <img src="${image.url}" alt="image">
                <div class="image-links">
                    <a href="#" data-link="img">复制图片标签</a>
                    <a href="#" data-link="url">复制链接</a>
                </div>
            `;
            
            // 绑定点击事件
            item.querySelector('[data-link="img"]').onclick = (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(
                    `<img src="${image.url}" alt="image" border="0" />`
                );
            };
            
            item.querySelector('[data-link="url"]').onclick = (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(
                    `<a href="${image.url.replace('i.imgs.ovh', 'imgloc.com/image')}">` +
                    `<img src="${image.url}" alt="image" border="0" /></a>`
                );
            };
        }
        
        return item;
    }

    setupPagination() {
        this.pagination.innerHTML = '';
        
        // 上一页按钮
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '上一页';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.changePage(this.currentPage - 1);
        
        // 页码按钮
        const pageButtons = this.generatePageButtons();
        
        // 下一页按钮
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '下一页';
        nextBtn.disabled = this.currentPage === this.totalPages;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);
        
        this.pagination.appendChild(prevBtn);
        pageButtons.forEach(btn => this.pagination.appendChild(btn));
        this.pagination.appendChild(nextBtn);
    }

    generatePageButtons() {
        const buttons = [];
        const maxButtons = 5; // 最多显示的页码按钮数
        
        let start = Math.max(1, this.currentPage - 2);
        let end = Math.min(this.totalPages, start + maxButtons - 1);
        
        if (end - start + 1 < maxButtons) {
            start = Math.max(1, end - maxButtons + 1);
        }
        
        for (let i = start; i <= end; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === this.currentPage ? 'active' : '';
            btn.onclick = () => this.changePage(i);
            buttons.push(btn);
        }
        
        return buttons;
    }

    changePage(page) {
        this.currentPage = page;
        this.loadImages(page);
        this.setupPagination();
        window.scrollTo(0, 0);
    }

    // 模拟从服务器获取图片数据
    async fetchImages(page) {
        // 这里应该是实际的API调用
        // 返回示例数据
        return Array(29).fill(null).map((_, index) => ({
            url: 'https://i.imgs.ovh/2025/01/27/br6d.png',
            isLastItem: index === 28 && page < this.totalPages
        }));
    }
}

// 初始化图片画廊
new ImageGallery(); 