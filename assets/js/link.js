class LinkManager {
    constructor() {
        this.linkFormats = {
            url: (url) => url,
            html: (url) => `<img src="${url}" alt="image">`,
            markdown: (url) => `![image](${url})`,
            bbcode: (url) => `[img]${url}[/img]`,
            ubb: (url) => `[img]${url}[/img]`
        };

        this.initLinkFormatSelector();
    }

    // 初始化链接格式选择器
    initLinkFormatSelector() {
        const selector = document.createElement('select');
        selector.id = 'linkFormatSelector';
        selector.innerHTML = Object.keys(this.linkFormats)
            .map(format => `<option value="${format}">${format.toUpperCase()}</option>`)
            .join('');

        // 添加到工具栏
        const tools = document.querySelector('.image-tools');
        if (tools) {
            const container = document.createElement('div');
            container.className = 'link-format-container';
            container.appendChild(selector);
            tools.appendChild(container);
        }
    }

    // 生成链接
    generateLink(url, format = 'url') {
        const formatter = this.linkFormats[format];
        return formatter ? formatter(url) : url;
    }

    // 生成短链接
    async generateShortLink(url) {
        try {
            // 这里可以接入短链接服务
            // 示例使用 TinyURL API
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error('短链接生成失败');
            return await response.text();
        } catch (error) {
            console.error('生成短链接失败:', error);
            return url;
        }
    }

    // 复制链接
    async copyLink(url, format = 'url') {
        const link = this.generateLink(url, format);
        try {
            await navigator.clipboard.writeText(link);
            this.showToast('链接已复制');
        } catch (error) {
            console.error('复制失败:', error);
            this.showToast('复制失败');
        }
    }

    // 生成CDN链接
    generateCDNLink(url, cdnProvider = 'default') {
        const cdnProviders = {
            default: (url) => url,
            jsdelivr: (url) => url.replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh'),
            staticaly: (url) => url.replace('raw.githubusercontent.com', 'cdn.staticaly.com')
        };

        const provider = cdnProviders[cdnProvider] || cdnProviders.default;
        return provider(url);
    }

    // 显示链接选项
    showLinkOptions(url) {
        const modal = document.createElement('div');
        modal.className = 'link-options-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>链接选项</h3>
                <div class="link-options">
                    ${Object.keys(this.linkFormats).map(format => `
                        <div class="link-option">
                            <label>${format.toUpperCase()}</label>
                            <input type="text" readonly value="${this.generateLink(url, format)}">
                            <button data-format="${format}">复制</button>
                        </div>
                    `).join('')}
                    <div class="link-option">
                        <label>短链接</label>
                        <input type="text" readonly data-short-link>
                        <button data-short-link-btn>生成</button>
                    </div>
                    <div class="link-option">
                        <label>CDN链接</label>
                        <select id="cdnSelector">
                            <option value="default">默认</option>
                            <option value="jsdelivr">jsDelivr</option>
                            <option value="staticaly">Staticaly</option>
                        </select>
                        <input type="text" readonly data-cdn-link value="${url}">
                        <button data-cdn-copy>复制</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        this.bindLinkOptionsEvents(modal, url);
    }

    // 绑定链接选项事件
    bindLinkOptionsEvents(modal, url) {
        // 关闭按钮
        modal.querySelector('.close').onclick = () => modal.remove();

        // 复制按钮
        modal.querySelectorAll('button[data-format]').forEach(btn => {
            btn.onclick = () => this.copyLink(url, btn.dataset.format);
        });

        // 短链接生成
        const shortLinkBtn = modal.querySelector('[data-short-link-btn]');
        const shortLinkInput = modal.querySelector('[data-short-link]');
        shortLinkBtn.onclick = async () => {
            shortLinkBtn.disabled = true;
            shortLinkBtn.textContent = '生成中...';
            const shortLink = await this.generateShortLink(url);
            shortLinkInput.value = shortLink;
            shortLinkBtn.textContent = '复制';
            shortLinkBtn.onclick = () => this.copyLink(shortLink);
        };

        // CDN链接
        const cdnSelector = modal.querySelector('#cdnSelector');
        const cdnInput = modal.querySelector('[data-cdn-link]');
        const cdnCopyBtn = modal.querySelector('[data-cdn-copy]');

        cdnSelector.onchange = () => {
            const cdnLink = this.generateCDNLink(url, cdnSelector.value);
            cdnInput.value = cdnLink;
        };

        cdnCopyBtn.onclick = () => this.copyLink(cdnInput.value);
    }

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

// 初始化链接管理器
const linkManager = new LinkManager(); 