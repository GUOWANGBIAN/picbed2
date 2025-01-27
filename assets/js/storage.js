class StorageManager {
    constructor() {
        this.storageConfigs = {
            github: {
                token: localStorage.getItem('github_token'),
                repo: localStorage.getItem('github_repo'),
                branch: localStorage.getItem('github_branch') || 'main',
                path: localStorage.getItem('github_path') || 'images'
            },
            qiniu: {
                accessKey: localStorage.getItem('qiniu_ak'),
                secretKey: localStorage.getItem('qiniu_sk'),
                bucket: localStorage.getItem('qiniu_bucket'),
                domain: localStorage.getItem('qiniu_domain')
            },
            aliyun: {
                accessKeyId: localStorage.getItem('aliyun_ak'),
                accessKeySecret: localStorage.getItem('aliyun_sk'),
                bucket: localStorage.getItem('aliyun_bucket'),
                region: localStorage.getItem('aliyun_region')
            }
        };

        this.currentStorage = localStorage.getItem('current_storage') || 'github';
    }

    // 上传到GitHub
    async uploadToGithub(file) {
        const { token, repo, branch, path } = this.storageConfigs.github;
        if (!token || !repo) {
            throw new Error('GitHub配置不完整');
        }

        const content = await this.fileToBase64(file);
        const filename = this.generateFilename(file);
        const url = `https://api.github.com/repos/${repo}/contents/${path}/${filename}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Upload ${filename}`,
                    content: content,
                    branch: branch
                })
            });

            if (!response.ok) throw new Error('GitHub上传失败');

            const data = await response.json();
            return data.content.download_url;
        } catch (error) {
            console.error('GitHub上传错误:', error);
            throw error;
        }
    }

    // 上传到七牛云
    async uploadToQiniu(file) {
        // 七牛云上传实现
        throw new Error('七牛云上传功能待实现');
    }

    // 上传到阿里云OSS
    async uploadToAliyun(file) {
        // 阿里云上传实现
        throw new Error('阿里云上传功能待实现');
    }

    // 生成文件名
    generateFilename(file) {
        const date = new Date();
        const timestamp = date.getTime();
        const ext = file.name.split('.').pop();
        return `${timestamp}.${ext}`;
    }

    // 文件转Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 保存配置
    saveConfig(platform, config) {
        Object.entries(config).forEach(([key, value]) => {
            localStorage.setItem(`${platform}_${key}`, value);
        });
        this.storageConfigs[platform] = config;
    }

    // 获取配置
    getConfig(platform) {
        return this.storageConfigs[platform];
    }

    // 切换存储平台
    setCurrentStorage(platform) {
        if (this.storageConfigs[platform]) {
            this.currentStorage = platform;
            localStorage.setItem('current_storage', platform);
        }
    }

    // 上传文件
    async uploadFile(file) {
        switch (this.currentStorage) {
            case 'github':
                return await this.uploadToGithub(file);
            case 'qiniu':
                return await this.uploadToQiniu(file);
            case 'aliyun':
                return await this.uploadToAliyun(file);
            default:
                throw new Error('未知的存储平台');
        }
    }
}

// 初始化存储管理器
const storageManager = new StorageManager(); 