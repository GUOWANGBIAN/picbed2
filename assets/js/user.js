class UserManager {
    constructor() {
        this.currentUser = null;
        this.initUserState();
        this.initEventListeners();
    }

    // 初始化用户状态
    initUserState() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForUser();
        }
    }

    // 初始化事件监听
    initEventListeners() {
        // 登录按钮
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginModal());
        // 注册按钮
        document.getElementById('registerBtn')?.addEventListener('click', () => this.showRegisterModal());
        // 设置按钮
        document.getElementById('settingBtn')?.addEventListener('click', () => this.showSettingsPanel());
    }

    // 显示登录模态框
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>登录</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" name="username" required>
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" name="password" required>
                    </div>
                    <button type="submit">登录</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.querySelector('#loginForm').onsubmit = (e) => {
            e.preventDefault();
            this.handleLogin(new FormData(e.target));
            modal.remove();
        };
    }

    // 处理登录
    async handleLogin(formData) {
        const username = formData.get('username');
        const password = formData.get('password');

        // 这里应该是真实的登录逻辑
        // 示例使用本地存储模拟
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const user = users[username];

        if (user && user.password === this.hashPassword(password)) {
            this.currentUser = {
                username,
                settings: user.settings || {},
                favorites: user.favorites || []
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.updateUIForUser();
            this.showToast('登录成功');
        } else {
            this.showToast('用户名或密码错误');
        }
    }

    // 显示注册模态框
    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>注册</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label>用户名</label>
                        <input type="text" name="username" required>
                    </div>
                    <div class="form-group">
                        <label>密码</label>
                        <input type="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label>确认密码</label>
                        <input type="password" name="confirmPassword" required>
                    </div>
                    <button type="submit">注册</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        modal.querySelector('.close').onclick = () => modal.remove();
        modal.querySelector('#registerForm').onsubmit = (e) => {
            e.preventDefault();
            this.handleRegister(new FormData(e.target));
            modal.remove();
        };
    }

    // 处理注册
    handleRegister(formData) {
        const username = formData.get('username');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showToast('两次密码不一致');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '{}');
        if (users[username]) {
            this.showToast('用户名已存在');
            return;
        }

        users[username] = {
            password: this.hashPassword(password),
            settings: {},
            favorites: []
        };

        localStorage.setItem('users', JSON.stringify(users));
        this.showToast('注册成功，请登录');
    }

    // 显示设置面板
    showSettingsPanel() {
        if (!this.currentUser) {
            this.showToast('请先登录');
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-content">
                <span class="close">&times;</span>
                <h2>个人设置</h2>
                <div class="settings-section">
                    <h3>存储设置</h3>
                    <div class="form-group">
                        <label>默认存储</label>
                        <select name="defaultStorage">
                            <option value="github">GitHub</option>
                            <option value="qiniu">七牛云</option>
                            <option value="aliyun">阿里云</option>
                        </select>
                    </div>
                </div>
                <div class="settings-section">
                    <h3>上传设置</h3>
                    <div class="form-group">
                        <label>默认压缩质量</label>
                        <input type="range" name="compressQuality" min="0" max="1" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>最大文件大小(MB)</label>
                        <input type="number" name="maxFileSize" min="1">
                    </div>
                </div>
                <button id="saveSettings">保存设置</button>
            </div>
        `;

        document.body.appendChild(panel);

        // 加载当前设置
        this.loadCurrentSettings(panel);

        // 绑定事件
        panel.querySelector('.close').onclick = () => panel.remove();
        panel.querySelector('#saveSettings').onclick = () => this.saveSettings(panel);
    }

    // 加载当前设置
    loadCurrentSettings(panel) {
        const settings = this.currentUser.settings;
        panel.querySelector('[name="defaultStorage"]').value = settings.defaultStorage || 'github';
        panel.querySelector('[name="compressQuality"]').value = settings.compressQuality || 0.8;
        panel.querySelector('[name="maxFileSize"]').value = settings.maxFileSize || 5;
    }

    // 保存设置
    saveSettings(panel) {
        const settings = {
            defaultStorage: panel.querySelector('[name="defaultStorage"]').value,
            compressQuality: parseFloat(panel.querySelector('[name="compressQuality"]').value),
            maxFileSize: parseInt(panel.querySelector('[name="maxFileSize"]').value)
        };

        this.currentUser.settings = settings;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        const users = JSON.parse(localStorage.getItem('users'));
        users[this.currentUser.username].settings = settings;
        localStorage.setItem('users', JSON.stringify(users));

        this.showToast('设置已保存');
        panel.remove();
    }

    // 更新UI
    updateUIForUser() {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span>欢迎，${this.currentUser.username}</span>
            <button id="logoutBtn">退出</button>
        `;

        const existingInfo = document.querySelector('.user-info');
        if (existingInfo) {
            existingInfo.replaceWith(userInfo);
        } else {
            document.querySelector('.nav-menu').prepend(userInfo);
        }

        document.getElementById('logoutBtn').onclick = () => this.handleLogout();
    }

    // 处理登出
    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        document.querySelector('.user-info')?.remove();
        this.showToast('已退出登录');
    }

    // 密码加密（示例使用简单的哈希）
    hashPassword(password) {
        return btoa(password); // 实际应用中应使用更安全的加密方式
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

// 初始化用户管理器
const userManager = new UserManager(); 