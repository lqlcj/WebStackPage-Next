# 部署指南

## 问题诊断

您遇到的 500 错误是因为 API 路由在 Cloudflare Pages 上运行时缺少必要的环境绑定。

### 错误信息
```
POST https://webstackpage-next.pages.dev/api/upload 500 (Internal Server Error)
POST https://webstackpage-next.pages.dev/api/nav 500 (Internal Server Error)
```

### 根本原因
- 项目使用 Next.js Edge Runtime (`export const runtime = 'edge'`)
- Edge Runtime 需要 Cloudflare KV（用于存储导航数据）和 R2（用于存储图片）
- 当前环境缺少这些绑定配置

---

## 解决方案

### 1. 本地开发环境

本地开发已经配置了降级方案，无需额外配置：

```bash
npm run dev
```

**本地开发特性：**
- ✅ 导航数据存储在内存中（会话级别）
- ✅ 图片上传转换为 data URL（仅用于本地测试）
- ✅ 无需 Cloudflare 账户

**注意：** 本地开发时，刷新页面后数据会丢失（因为存储在内存中）。

---

### 2. Cloudflare Pages 生产环境配置

#### 2.1 创建 Cloudflare KV 命名空间

```bash
# 使用 Wrangler CLI
wrangler kv:namespace create "WEBSTACK_KV"
wrangler kv:namespace create "WEBSTACK_KV" --preview
```

#### 2.2 创建 Cloudflare R2 存储桶

1. 登录 Cloudflare 控制面板
2. 进入 R2 → 创建存储桶
3. 命名为 `webstack` 或其他名称
4. 记下公共 URL（例如：`https://photo.lcjlq.com`）

#### 2.3 配置 wrangler.toml

在项目根目录创建或编辑 `wrangler.toml`：

```toml
name = "webstack-nav"
type = "service"
account_id = "YOUR_ACCOUNT_ID"
workers_dev = true

# KV 绑定
kv_namespaces = [
  { binding = "WEBSTACK_KV", id = "YOUR_KV_ID", preview_id = "YOUR_KV_PREVIEW_ID" }
]

# R2 绑定
r2_buckets = [
  { binding = "WEBSTACK_BUCKET", bucket_name = "webstack", preview_bucket_name = "webstack-preview" }
]

# 环境变量
env.production.vars = { R2_PUBLIC_BASE_URL = "https://photo.lcjlq.com" }
```

#### 2.4 配置 Cloudflare Pages 环境变量

在 Cloudflare 控制面板中：

1. 进入 Pages → 您的项目 → 设置 → 环境变量
2. 添加以下变量：
   - `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`: `https://photo.lcjlq.com`（替换为您的 R2 公共 URL）

#### 2.5 配置 Cloudflare Pages 函数绑定

在 `functions` 目录下创建 `_middleware.ts`（如果不存在）：

```typescript
export const onRequest = async (context) => {
  // Cloudflare 会自动注入 KV 和 R2 绑定到 globalThis.env
  return context.next()
}
```

或者在 Cloudflare Pages 控制面板中：

1. 进入 Pages → 您的项目 → 设置 → 函数
2. 绑定 KV 命名空间：
   - 变量名：`WEBSTACK_KV`
   - KV 命名空间：选择之前创建的命名空间
3. 绑定 R2 存储桶：
   - 变量名：`WEBSTACK_BUCKET`
   - R2 存储桶：选择 `webstack`

---

## 代码修复说明

### storage-edge.ts 改进

已更新 `src/lib/storage-edge.ts` 以支持：

1. **生产环境（Cloudflare）**
   - 使用 KV 存储导航数据
   - 使用 R2 存储图片

2. **本地开发环境**
   - 使用内存缓存存储导航数据
   - 使用 data URL 存储图片（仅用于测试）
   - 自动从 `src/data/nav.json` 读取初始数据

### API 路由改进

已改进 `/api/nav` 和 `/api/upload` 路由的错误处理：

- 添加详细的错误日志
- 返回更有意义的错误信息
- 支持开发和生产环境的无缝切换

---

## 测试步骤

### 1. 本地测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 访问 http://localhost:3000/admin（管理后台）
# 默认密码：admin123
```

### 2. 验证 API

```bash
# 获取导航数据
curl http://localhost:3000/api/nav

# 登录（获取 token）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'

# 上传图片（需要先登录）
curl -X POST http://localhost:3000/api/upload \
  -H "Cookie: token=dev-token" \
  -F "file=@image.png"
```

### 3. 生产环境测试

部署到 Cloudflare Pages 后，验证：

```bash
# 检查 API 是否正常工作
curl https://webstackpage-next.pages.dev/api/nav

# 检查错误日志
# 在 Cloudflare 控制面板 → Pages → 您的项目 → 分析 → 日志
```

---

## 常见问题

### Q: 为什么本地开发时数据会丢失？
A: 本地开发使用内存缓存，刷新页面后数据会丢失。这是设计的，用于快速开发。生产环境使用 KV 会持久化数据。

### Q: 本地上传的图片为什么显示不出来？
A: 本地开发使用 data URL，这在浏览器中可以正常显示，但刷新页面后会丢失。生产环境使用 R2 会持久化存储。

### Q: 如何在本地测试 R2 上传？
A: 可以使用 Wrangler 的本地模拟环境：
```bash
wrangler dev --local
```

### Q: 生产环境仍然返回 500 错误怎么办？
A: 检查以下几点：
1. KV 命名空间是否正确绑定（变量名必须是 `WEBSTACK_KV`）
2. R2 存储桶是否正确绑定（变量名必须是 `WEBSTACK_BUCKET`）
3. 环境变量 `R2_PUBLIC_BASE_URL` 是否正确设置
4. 查看 Cloudflare Pages 的函数日志获取详细错误信息

---

## 部署命令

```bash
# 构建项目
npm run build

# 部署到 Cloudflare Pages（需要配置 git 集成）
git push origin main

# 或者使用 Wrangler 部署
wrangler pages deploy dist
```

---

## 相关文档

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare KV 文档](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-node-runtimes)

