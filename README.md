
# WebStackPage-Next

演示地址：https://webstackpage-next.pages.dev/

基于开源项目：WebStackPage.github.io 重构的轻量 Next.js + TypeScript 静态/SSR 信息展示站点模板，包含站点配置、导航、可复用组件与简单的管理页面。

首先部署成本是：花十几元去某鱼开通个cloudflareR2存储和KV存储，这个项目的前后端就闭环了，可以在后台非常方便的增删改查了。

## 增删改查功能

前端和原项目原型一模一样，用react重写。加装了后台增删改查功能，你只需把项目部署在cloudflare上，配置好KV和R2存储，即可拥有一个永久免费的前后端个人导航。

登录后台方式是在域名后加：/admin/login   登录后会重定向到admin页面，初始密码admin123  后续你换成自己的KV密码就行。

增删改查自动同步到cloudflare的KV存储上，图片自动更新到R2存储里，删除会同时删除KV存储的数据和R2存储的图片。

<img width="925" height="708" alt="image" src="https://github.com/user-attachments/assets/60acfa2e-e0b5-4aa6-9062-a91d8583b137" />


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
