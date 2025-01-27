# 基于 imgloc.com 的私人图床
## 上传图片
### 在imgloc中上传图片 选择后下拉在 【直接（源文件）链接】中找到【图片URL】
### 复制到替换index.html中   <!-- 中部内容 --> 的源码
###       img src="https://example.com/imageX.jpg" alt="Image X" onclick="window.open('https://example.com/imageX.jpg', '_blank')"
## 需要替换
### img src="https//example.com/imageX.jpg"中的URL地址为上文获取的【图片URL】
### alt="Image X" 中的 X 为图片序号 一次递推
### open('https://example.com/imageX.jpg', '_blank')"中的URL替换为【图片URL】*需和上一步的地址相同
