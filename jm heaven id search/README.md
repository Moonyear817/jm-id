# 身份证地区识别漫画搜索

一个全栈 Web 应用，可以根据身份证号前6位识别地区，然后搜索禁漫天堂中相关的漫画内容。

## 📋 功能特性

- 🆔 **身份证识别**：选择省份 → 城市 → 区县，自动生成身份证号前6位
- 🔍 **网络搜索**：使用网页爬虫搜索禁漫天堂中的相关漫画
- 📱 **响应式设计**：支持桌面端和移动端
- ⚡ **快速响应**：前后端分离，异步数据加载
- 🎨 **美观界面**：现代化 UI，动画效果

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express** - Web 服务器
- **Axios** - HTTP 请求
- **Cheerio** - HTML 解析和网页爬虫
- **CORS** - 跨域资源共享

### 前端
- **React 18** - UI 框架
- **Axios** - HTTP 客户端
- **CSS3** - 样式和动画

## 📦 项目结构

```
jm heaven id search/
├── backend/
│   ├── package.json
│   ├── server.js          # 主服务器文件
│   ├── idCodes.js         # 身份证编码数据库
│   └── scraper.js         # 网页爬虫模块
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js         # 主应用组件
        └── App.css        # 样式文件
```

## 🚀 快速开始

### 1. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 2. 启动服务

**启动后端服务器（在 `backend` 目录）：**
```bash
npm start
# 或开发模式
npm run dev
```

后端服务将运行在 `http://localhost:5000`

**启动前端开发服务器（在新终端，进入 `frontend` 目录）：**
```bash
npm start
```

前端应用将在浏览器中打开 `http://localhost:3000`

### 3. 使用应用

1. 在左侧面板选择您的地区（省份 → 城市 → 区县）
2. 系统会自动识别您的身份证号前6位
3. 点击"搜索漫画"按钮
4. 在右侧查看搜索结果
5. 点击漫画卡片可查看详细信息

## 📝 API 端点

### 获取省份列表
```
GET /api/provinces
```

### 获取城市列表
```
GET /api/cities/:provinceCode
```

### 获取区县列表
```
GET /api/districts/:provinceCode/:cityCode
```

### 获取地区详情
```
GET /api/location/:code
参数: code (身份证号前6位)
```

### 搜索漫画
```
GET /api/search?idCode=330108
或
GET /api/search?keyword=搜索关键词
```

### 获取漫画详情
```
GET /api/comic-detail?url=漫画URL
```

## ⚙️ 配置

### 扩展地区数据

在 `backend/idCodes.js` 中添加更多省份和城市数据：

```javascript
"34": { // 安徽
  name: "安徽省",
  cities: {
    "01": {
      name: "合肥市",
      districts: {
        "01": { name: "瑶海区", code: "340101" },
        // ... 更多区县
      }
    }
  }
}
```

### 修改爬虫规则

根据禁漫天堂的实际网站结构，修改 `backend/scraper.js` 中的 CSS 选择器：

```javascript
// 修改这些选择器以匹配实际的 HTML 结构
$('.comic-item, .comic-card, [class*="comic"]').each((index, element) => {
  // ...
});
```

## ⚠️ 重要说明

1. **法律合规**：本工具仅供学习研究使用，请遵守相关法律法规
2. **网站变化**：禁漫天堂网站结构可能变化，爬虫规则需要相应调整
3. **隐私保护**：本应用不会存储用户的身份证信息
4. **反爬虫**：某些网站可能有反爬虫措施，请合理使用

## 🔧 故障排除

### 后端无法启动
```bash
# 确保 Node.js 已安装
node --version

# 检查端口 5000 是否被占用
lsof -i :5000

# 如果被占用，可以修改 server.js 中的 PORT
const PORT = process.env.PORT || 3001;
```

### 前端无法连接到后端
- 确保后端服务器正在运行
- 检查 `frontend/package.json` 中的 `proxy` 设置是否正确
- 在浏览器控制台检查网络请求

### 搜索结果为空
- 禁漫天堂网站可能已更改结构
- 需要更新 `backend/scraper.js` 中的 CSS 选择器
- 尝试使用浏览器开发者工具检查网站的 HTML 结构

## 📄 许可证

本项目仅供学习使用。

## 🙋 反馈和建议

如有任何问题或建议，欢迎提出！
