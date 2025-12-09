# 故障排查指南

## 问题：API 返回 500 错误

### 症状
- 前端显示"上传失败"或"加载数据失败"
- 浏览器控制台显示 `POST /api/upload 500` 或 `POST /api/nav 500`
- 后端日志显示 `KV binding WEBSTACK_KV is not available` 或 `R2 binding WEBSTACK_BUCKET is not available`

### 原因分析

#### 本地开发环境
- ✅ **已修复**：现在使用内存缓存和 data URL，无需 KV/R2

#### 生产环境（Cloudflare Pages）
- ❌ **未配置 KV 绑定**：导致 `/api/nav` 返回 500
- ❌ **未配置 R2 绑定**：导致 `/api/upload` 返回 500

### 解决步骤

#### 1. 本地开发
```bash
# 清除 node_modules 和缓存
rm -rf node_modules .next

# 重新安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

**预期结果：**
- ✅ 首页能加载导航数据
- ✅ 管理后台能登录（密码：admin123）
- ✅ 能上传图片（显示为 data URL）

#### 2. 生产环境（Cloudflare Pages）

**步骤 A：创建 KV 命名空间**

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 创建 KV 命名空间
wrangler kv:namespace create "WEBSTACK_KV"
wrangler kv:namespace create "WEBSTACK_KV" --preview

# 记下输出中的 ID，例如：
# ✓ Created namespace with title "WEBSTACK_KV"
# Add the following to your wrangler.toml:
# kv_namespaces = [
#   { binding = "WEBSTACK_KV", id = "abc123...", preview_id = "def456..." }
# ]
```

**步骤 B：创建 R2 存储桶**

1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com/)
2. 进入 R2 → 创建存储桶
3. 命名为 `webstack`
4. 记下公共 URL（例如：`https://photo.lcjlq.com`）

**步骤 C：配置 wrangler.toml**

在项目根目录创建 `wrangler.toml`：

```toml
name = "webstack-nav"
type = "service"
account_id = "YOUR_ACCOUNT_ID"  # 从 Cloudflare 控制面板获取
workers_dev = true

kv_namespaces = [
  { binding = "WEBSTACK_KV", id = "YOUR_KV_ID", preview_id = "YOUR_KV_PREVIEW_ID" }
]

r2_buckets = [
  { binding = "WEBSTACK_BUCKET", bucket_name = "webstack", preview_bucket_name = "webstack-preview" }
]

[env.production]
vars = { R2_PUBLIC_BASE_URL = "https://photo.lcjlq.com" }
```

**步骤 D：在 Cloudflare Pages 中配置绑定**

1. 登录 Cloudflare 控制面板
2. 进入 Pages → 您的项目 → 设置 → 函数
3. **KV 命名空间绑定**
   - 点击"添加绑定"
   - 变量名：`WEBSTACK_KV`
   - KV 命名空间：选择 `WEBSTACK_KV`
4. **R2 存储桶绑定**
   - 点击"添加绑定"
   - 变量名：`WEBSTACK_BUCKET`
   - R2 存储桶：选择 `webstack`

**步骤 E：配置环境变量**

在 Cloudflare Pages 中：

1. 进入 Pages → 您的项目 → 设置 → 环境变量
2. 添加变量：
   - 名称：`R2_PUBLIC_BASE_URL`
   - 值：`https://photo.lcjlq.com`（替换为您的 R2 公共 URL）
   - 环境：生产和预览

**步骤 F：重新部署**

```bash
# 提交并推送代码
git add .
git commit -m "Configure Cloudflare KV and R2 bindings"
git push origin main

# Cloudflare Pages 会自动部署
# 或者手动触发部署：
wrangler pages deploy dist
```

---

## 问题：本地开发时数据丢失

### 症状
- 刷新页面后，之前编辑的数据消失
- 上传的图片显示不出来

### 原因
- 本地开发使用内存缓存（会话级别）
- 图片存储为 data URL（浏览器内存）

### 解决方案
这是设计的行为。如果需要持久化存储，可以：

1. **使用本地 SQLite 数据库**
   ```bash
   npm install better-sqlite3
   ```
   然后修改 `storage-edge.ts` 使用 SQLite

2. **使用 Cloudflare Pages Functions 本地模拟**
   ```bash
   wrangler pages dev
   ```
   这会使用 Cloudflare 的本地模拟环境

3. **直接编辑 src/data/nav.json**
   - 修改 JSON 文件
   - 重启开发服务器

---

## 问题：上传图片失败

### 症状
- 点击"上传"按钮后显示"上传失败"
- 浏览器控制台显示 `POST /api/upload 500`

### 原因分析

#### 本地开发
- 可能是文件太大（data URL 有大小限制）
- 可能是文件格式不支持

#### 生产环境
- R2 绑定未配置
- R2 存储桶权限不足
- 文件大小超过限制

### 解决步骤

#### 1. 检查文件大小
```bash
# 本地开发：data URL 限制约 1MB
# 生产环境：R2 限制 5GB（通常足够）

# 如果文件过大，压缩后重试
```

#### 2. 检查文件格式
支持的格式：`png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `ico`, `bmp`, `avif`

#### 3. 检查 R2 权限
在 Cloudflare 控制面板中：
1. 进入 R2 → 存储桶 → `webstack`
2. 检查"权限"设置
3. 确保允许 Pages Functions 写入

#### 4. 查看详细错误
在浏览器开发者工具中：
```javascript
// 打开控制台，查看错误信息
fetch('/api/upload', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 问题：登录失败

### 症状
- 输入密码后显示"登录失败"
- 浏览器控制台显示 `POST /api/auth/login 401`

### 原因
- 密码错误
- 环境变量 `ADMIN_PASSWORD` 未设置

### 解决步骤

#### 本地开发
- 默认密码：`admin123`
- 可以通过环境变量覆盖：
  ```bash
  ADMIN_PASSWORD=mypassword npm run dev
  ```

#### 生产环境
1. 在 Cloudflare Pages 中设置环境变量：
   - 名称：`ADMIN_PASSWORD`
   - 值：您的密码
2. 重新部署

---

## 问题：导航数据为空

### 症状
- 首页显示"暂无数据"
- 管理后台显示"数据为空"

### 原因
- KV 中没有保存过数据
- 初始化数据未加载

### 解决步骤

#### 本地开发
1. 访问 http://localhost:3000/admin
2. 登录（密码：admin123）
3. 编辑导航数据
4. 点击"保存"

#### 生产环境
1. 在本地编辑 `src/data/nav.json`
2. 登录管理后台
3. 切换到 JSON 视图
4. 复制 `src/data/nav.json` 的内容
5. 粘贴到 JSON 编辑器
6. 点击"保存"

---

## 问题：CORS 错误

### 症状
- 浏览器控制台显示 CORS 错误
- 跨域请求被阻止

### 原因
- 前端和后端域名不同
- 服务器未设置 CORS 头

### 解决步骤

#### 本地开发
- 通常不会出现 CORS 错误（同源）

#### 生产环境
在 `/api/` 路由中添加 CORS 头：

```typescript
export async function GET() {
  const response = NextResponse.json(data)
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
```

---

## 调试技巧

### 1. 启用详细日志
在 `storage-edge.ts` 中添加日志：

```typescript
console.log('[Storage] getNavData called')
console.log('[Storage] env.WEBSTACK_KV:', env?.WEBSTACK_KV ? 'available' : 'not available')
```

### 2. 检查 Cloudflare 日志
```bash
# 查看实时日志
wrangler tail

# 或在控制面板中：
# Pages → 您的项目 → 分析 → 日志
```

### 3. 测试 API 端点
```bash
# 获取导航数据
curl -v https://webstackpage-next.pages.dev/api/nav

# 检查响应头
curl -i https://webstackpage-next.pages.dev/api/nav

# 查看详细错误
curl -v --trace-ascii /dev/stdout https://webstackpage-next.pages.dev/api/nav
```

### 4. 本地模拟生产环境
```bash
# 使用 Wrangler 本地模拟 Cloudflare 环境
wrangler pages dev

# 这会使用 KV 和 R2 的本地模拟
```

---

## 获取帮助

如果以上步骤都不能解决问题，请：

1. 检查 Cloudflare 控制面板中的错误日志
2. 查看浏览器开发者工具的网络标签
3. 运行 `npm run build` 检查构建错误
4. 查看 `DEPLOYMENT.md` 中的完整配置说明

