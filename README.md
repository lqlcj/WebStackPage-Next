// ...existing code...

# WebStackPage

轻量的 Next.js + TypeScript 静态/SSR 信息展示站点模板，包含站点配置、导航、可复用组件与简单的管理页面。

## 主要功能

- 基于 Next.js App Router（app/）的现代页面结构
- 可配置的站点信息与导航（参见配置文件）
- 可复用组件库（布局、卡片、关于区块等）
- 静态资源与公用样式支持

## 快速开始

1. 安装依赖：

```sh
npm install
```

2. 本地开发：

```sh
npm run dev
```

3. 生产构建与启动：

```sh
npm run build
npm run start
```

配置与脚本参见 [package.json](package.json)。

## 项目结构（关键文件）

- 应用入口与布局：[`src/app/layout.tsx`](src/app/layout.tsx), [`src/app/page.tsx`](src/app/page.tsx)
- 布局组件：[`LayoutShell`](src/components/LayoutShell.tsx)
- 页面组件示例：[`AboutSection`](src/components/AboutSection.tsx), [`SiteCard`](src/components/SiteCard.tsx)
- 站点配置：[`src/config/site.ts`](src/config/site.ts)
- 导航数据：[`src/data/nav.json`](src/data/nav.json)
- Hooks：[`useNavigation`](src/hooks/useNavigation.ts), [`useScrollSpy`](src/hooks/useScrollSpy.ts)
- 本地存储/边缘存储逻辑：[`src/lib/storage.ts`](src/lib/storage.ts), [`src/lib/storage-edge.ts`](src/lib/storage-edge.ts)
- 全局样式：[`src/styles/globals.css`](src/styles/globals.css)
- Next 配置：[`next.config.js`](next.config.js)
- TypeScript 配置：[`tsconfig.json`](tsconfig.json)
- 公共静态资源：[`public/assets`](public/assets)

## 开发提示

- 导航逻辑与数据：查看 [`src/utils/nav.ts`](src/utils/nav.ts) 与 [`src/hooks/useNavigation.ts`](src/hooks/useNavigation.ts) 以了解如何添加/修改导航项。
- 若需修改站点元信息或社交链接，编辑 [`src/config/site.ts`](src/config/site.ts)。
- 组件放置在 [`src/components`](src/components) 下，样式优先使用模块化或全局样式文件。

## 部署

- 本项目可部署到任何支持 Next.js 的平台（Vercel、Netlify 等）。
- 若需静态导出或自定义服务器行为，请参考 [`next.config.js`](next.config.js)。

## 维护与贡献

- 请遵循现有代码风格（TypeScript + React + CSS Modules / 全局 CSS）。
- 建议在提交前运行 ESLint 与类型检查：

```sh
npm run lint
npm run type-check
```

## 许可

该仓库包含 LICENSE 文件，请参阅根目录的 [LICENSE](LICENSE)。

// ...existing code...
