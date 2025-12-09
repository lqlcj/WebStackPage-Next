# WebStack Navigation - Next.js 版本

这是基于原始 WebStackPage 项目的 Next.js 14+ (App Router) 重构版本。

## 📂 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局文件，包含全局 meta 和样式引入
│   │   └── page.tsx            # 首页，组合 Sidebar 和 MainContent
│   ├── components/
│   │   ├── Sidebar.tsx         # 侧边栏菜单组件（可折叠）
│   │   ├── Sidebar.module.css  # 侧边栏样式
│   │   ├── MainContent.tsx     # 主内容区域组件
│   │   └── SiteCard.tsx        # 单个网站卡片组件
│   ├── data/
│   │   └── nav.json            # 导航菜单数据（KV 格式）
│   ├── types/
│   │   └── nav.ts             # TypeScript 类型定义
│   └── styles/
│       └── globals.css         # 全局样式
├── public/
│   └── assets/                 # 静态资源（从原项目复制）
│       ├── css/
│       ├── images/
│       └── js/
├── package.json
├── tsconfig.json
├── next.config.js
└── .eslintrc.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 复制静态资源

确保原项目的 `assets` 文件夹已复制到 `public/assets`：

```bash
# 从原项目复制
cp -r ../WebStackPage.github.io/assets ./public/
```

### 3. 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000` 查看网站。

### 4. 生产构建

```bash
npm run build
npm start
```

## 📋 数据结构说明

导航数据采用 **KV (Key-Value)** 模式存储在 `src/data/nav.json`：

### 类型定义

```typescript
// 普通一级分类（直接包含网址）
interface CategoryLink {
  id: string;           // 锚点ID
  type: "link";
  title: string;        // 分类标题
  icon: string;         // 图标类名（linecons-* 或 fa-*）
  items: Site[];        // 网站列表
}

// 折叠目录（包含子分类）
interface SubMenuFolder {
  id: string;
  type: "folder";
  title: string;
  icon: string;
  children: CategoryLink[];  // 子分类列表
}

// 单个网站
interface Site {
  name: string;         // 网站名称
  url: string;          // 网站链接
  desc: string;         // 网站描述
  logo: string;         // logo 路径
}
```

## 🎨 样式说明

### CSS 框架

- **Bootstrap**: 用于栅格布局
- **Xenon**: 自定义 UI 组件样式
- **Linecons & FontAwesome**: 图标库

**禁止使用 Tailwind CSS**，所有样式均来自原项目的 CSS 文件。

### 样式文件位置

所有 CSS 文件位于 `public/assets/css/`：
- `bootstrap.css` - 栅格和基础样式
- `xenon-core.css` - 核心组件
- `xenon-components.css` - 组件样式
- `xenon-skins.css` - 皮肤主题
- `nav.css` - 导航特定样式

## ⚙️ React Hooks 交互

### 已实现的功能

1. **侧边栏折叠/展开**
   - 使用 `useState` 管理展开状态
   - 点击文件夹菜单项可展开/收起子菜单

2. **平滑滚动**
   - 使用 `useEffect` 监听点击事件
   - 点击菜单项自动滚动到对应锚点

3. **网站卡片点击**
   - 点击卡片在新标签页打开网站链接

## 🔗 资源路径修正

原项目使用相对路径 `../assets/`，已修正为 Next.js 的绝对路径 `/assets/`：

```
原: <img src="../assets/images/logo@2x.png" />
改: <img src="/assets/images/logo@2x.png" />
```

## 📱 响应式设计

使用 Bootstrap 的栅格系统：
- `col-sm-3` - 小屏幕 3 列布局
- `hidden-xs` / `hidden-sm` - 响应式隐藏
- `visible-xs` - 仅在移动设备显示

## 🔄 jQuery 移除

所有原项目中的 jQuery 代码已用 React Hooks 重写：
- ✅ 侧边栏折叠 → `useState`
- ✅ 平滑滚动 → `useEffect` + `scrollIntoView`
- ✅ 事件处理 → React 事件系统

## 📝 更新导航数据

编辑 `src/data/nav.json` 来添加/修改网站：

```json
{
  "menus": [
    {
      "id": "recommend",
      "type": "link",
      "title": "常用推荐",
      "icon": "linecons-star",
      "items": [
        {
          "name": "网站名称",
          "url": "https://example.com",
          "desc": "网站描述",
          "logo": "/assets/images/logos/example.png"
        }
      ]
    }
  ]
}
```

## 🐛 常见问题

### 样式不加载？
- 确保 `public/assets` 目录存在
- 检查 `src/app/layout.tsx` 中的 CSS 链接路径

### 图片加载失败？
- 确保 logo 文件存在于 `public/assets/images/logos/`
- 检查文件名是否正确（区分大小写）

### 菜单不展开？
- 检查浏览器控制台是否有 JavaScript 错误
- 确保 `Sidebar.tsx` 中的 `toggleFolder` 函数正确

## 📄 许可证

继承原项目的许可证。

## 🤝 贡献

欢迎提交 PR 和 Issue！

