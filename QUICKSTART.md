# 🚀 快速开始指南

## 5 分钟快速上手 WebStack Next.js 版本

### 步骤 1: 安装依赖 (1 分钟)

```bash
npm install
```

### 步骤 2: 复制资源文件 (1 分钟)

从原始项目复制 `assets` 文件夹：

**Windows:**
```bash
xcopy ..\WebStackPage.github.io\assets public\assets /E /I
```

**Mac/Linux:**
```bash
cp -r ../WebStackPage.github.io/assets ./public/
```

### 步骤 3: 启动开发服务器 (1 分钟)

```bash
npm run dev
```

### 步骤 4: 打开浏览器 (1 分钟)

访问 `http://localhost:3000`

### 步骤 5: 开始编辑 (1 分钟)

编辑 `src/data/nav.json` 来添加/修改网站，页面会自动刷新。

---

## 📁 项目文件说明

### 关键文件

| 文件 | 说明 | 修改频率 |
|------|------|--------|
| `src/data/nav.json` | 导航菜单和网站数据 | ⭐⭐⭐ 经常 |
| `src/components/Sidebar.tsx` | 侧边栏菜单 | ⭐ 很少 |
| `src/components/MainContent.tsx` | 主内容区域 | ⭐ 很少 |
| `src/app/page.tsx` | 首页 | ⭐ 很少 |
| `public/assets/css/nav.css` | 导航样式 | ⭐⭐ 有时 |

### 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 首页
│   └── about/page.tsx     # 关于页面
├── components/            # React 组件
│   ├── Sidebar.tsx        # 侧边栏
│   ├── MainContent.tsx    # 主内容
│   └── SiteCard.tsx       # 网站卡片
├── data/
│   └── nav.json           # 导航数据 ⭐ 重点
├── types/
│   └── nav.ts             # TypeScript 类型
└── styles/
    └── globals.css        # 全局样式

public/
└── assets/                # 静态资源（需复制）
    ├── css/
    ├── images/
    └── js/
```

---

## 🎯 常见任务

### 添加新网站

编辑 `src/data/nav.json`：

```json
{
  "id": "recommend",
  "type": "link",
  "title": "常用推荐",
  "items": [
    {
      "name": "新网站名称",
      "url": "https://example.com",
      "desc": "网站描述",
      "logo": "/assets/images/logos/example.png"
    }
  ]
}
```

### 添加新分类

在 `menus` 数组中添加：

```json
{
  "id": "new-category",
  "type": "link",
  "title": "新分类",
  "icon": "linecons-star",
  "items": []
}
```

### 创建子菜单

使用 `type: "folder"`：

```json
{
  "id": "parent",
  "type": "folder",
  "title": "父菜单",
  "icon": "linecons-lightbulb",
  "children": [
    {
      "id": "child",
      "type": "link",
      "title": "子菜单",
      "items": []
    }
  ]
}
```

### 修改样式

在 `src/styles/globals.css` 中添加：

```css
.sidebar-menu {
  background-color: #f0f0f0;
}

.main-content {
  padding: 20px;
}
```

---

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 运行 ESLint
npm run lint
```

---

## 📊 数据格式速查

### 网站对象

```typescript
interface Site {
  name: string;      // "Dribbble"
  url: string;       // "https://dribbble.com/"
  desc: string;      // "全球UI设计师作品分享平台。"
  logo: string;      // "/assets/images/logos/dribbble.png"
}
```

### 分类对象

```typescript
interface CategoryLink {
  id: string;        // "recommend"
  type: "link";
  title: string;     // "常用推荐"
  icon: string;      // "linecons-star"
  items: Site[];     // 网站列表
}
```

### 文件夹对象

```typescript
interface SubMenuFolder {
  id: string;        // "materials"
  type: "folder";
  title: string;     // "素材资源"
  icon: string;      // "linecons-thumbs-up"
  children: CategoryLink[];  // 子分类列表
}
```

---

## 🎨 可用图标

### Linecons 图标

```
linecons-star          ⭐ 星星
linecons-doc           📄 文档
linecons-light[object Object]灯泡
linecons-thumbs-up     👍 赞
linecons-diamond       💎 钻石
linecons-pencil        ✏️ 铅笔
linecons-user          👤 用户
linecons-heart         ❤️ 心形
linecons-cog           ⚙️ 齿轮
```

### FontAwesome 图标

```
fa-star                ⭐ 星星
fa-bars                ☰ 菜单
fa-github              🐙 GitHub
fa-search              🔍 搜索
```

---

## 🐛 快速排查

| 问题 | 解决方案 |
|------|--------|
| 样式不加载 | 检查 `public/assets` 是否存在 |
| 图片显示失败 | 检查 logo 路径是否正确 |
| 菜单不展开 | 检查浏览器控制台错误 |
| 页面不刷新 | 手动刷新浏览器或重启开发服务器 |

---

## 📚 更多信息

- 详细设置: 查看 `SETUP_GUIDE.md`
- 项目说明: 查看 `README_NEXTJS.md`
- 原始项目: https://github.com/WebStackPage/WebStackPage.github.io

---

**现在就开始吧！** 🎉

```bash
npm install && npm run dev
```

然后访问 `http://localhost:3000` [object Object]
