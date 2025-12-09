# 🚀 WebStack Next.js - 快速开始

## ✅ 已完成的配置

- ✅ npm 依赖已安装
- ✅ 资源文件已移动到 `public/assets`
- ✅ 原始 HTML 文件已删除
- ✅ 项目结构已优化

## 🎯 快速命令

### 开发模式
```bash
npm run dev
```
然后访问 `http://localhost:3000`

### 生产构建
```bash
npm run build
npm start
```

### 代码检查
```bash
npm run lint
```

## 📁 项目结构

```
src/
├── app/                    # Next.js 页面
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 首页
│   └── about/page.tsx     # 关于页面
├── components/            # React 组件
│   ├── Sidebar.tsx        # 侧边栏
│   ├── MainContent.tsx    # 主内容
│   └── SiteCard.tsx       # 网站卡片
├── hooks/                 # 自定义 Hooks
├── utils/                 # 工具函数
├── data/                  # 导航数据
└── styles/                # 样式文件

public/
└── assets/                # 静态资源（已配置）
```

## 📝 常见任务

### 添加新网站
编辑 `src/data/nav.json`：
```json
{
  "name": "网站名称",
  "url": "https://example.com",
  "desc": "网站描述",
  "logo": "/assets/images/logos/example.png"
}
```

### 修改样式
编辑 `src/styles/globals.css`

### 添加新页面
创建 `src/app/new-page/page.tsx`

## 🔧 配置文件

- `package.json` - 项目依赖
- `tsconfig.json` - TypeScript 配置
- `next.config.js` - Next.js 配置
- `.eslintrc.json` - ESLint 配置

## 📚 文档

- `README_NEXTJS.md` - 项目详细说明
- `QUICKSTART.md` - 完整快速开始指南
- `START_HERE.md` - 项目总体说明

## 🎉 现在就开始！

```bash
npm run dev
```

访问 `http://localhost:3000` 查看你的网站！

---

**需要帮助？** 查看 `README_NEXTJS.md` 或 `QUICKSTART.md`

