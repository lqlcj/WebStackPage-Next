# 快速修复指南

## 问题总结

您的项目在 Cloudflare Pages 上部署时，API 返回 500 错误：
- `POST /api/upload 500`
- `POST /api/nav 500`

**根本原因**：缺少 Cloudflare KV 和 R2 的绑定配置

---

## 快速修复（3 步）

### 第 1 步：本地测试（验证修复有效）

```bash
# 清除缓存
rm -rf node_modules .next

# 重新安装
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 应该能看到导航页面（数据来自 src/data/nav.json）
```

**预期结果**：✅ 首页能加载，管理后台能登录

---

### 第 2 步：生产环境配置（Cloudflare Pages）

#### 2.1 创建 KV 命名空间

```bash
npm install -g wrangler
wrangler kv:namespace create "WEBSTACK_KV"
wrangler kv:namespace create "WEBSTACK_KV" --preview
```

记下输出的 ID（例如：`abc123...` 和 `def456...`）

#### 2.2 创建 R2 存储桶

1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com/)
2. R2 → 创建存储桶 → 命名为 `webstack`
3. 记下公共 URL（例如：`https://photo.lcjlq.com`）

#### 2.3 配置 Cloudflare Pages

在 Cloudflare 控制面板中：

1. **Pages** → 您的项目 → **设置** → **函数**

2. **KV 命名空间绑定**
   - 点击"添加绑定"
   - 变量名：`WEBSTACK_KV`
   - KV 命名空间：选择 `WEBSTACK_KV`

3. **R2 存储桶绑定**
   - 点击"添加绑定"
   - 变量名：`WEBSTACK_BUCKET`
   - R2 存储桶：选择 `webstack`

4. **环境变量**
   - 进入 **设置** → **环境变量**
   - 添加：`R2_PUBLIC_BASE_URL` = `https://photo.lcjlq.com`

---

### 第 3 步：重新部署

```bash
# 提交代码
git add .
git commit -m "Fix API 500 errors with Cloudflare KV and R2 configuration"
git push origin main

# Cloudflare Pages 会自动部署
```

**等待 2-3 分钟后，访问您的网站**

---

## 验证修复

### 本地验证
```bash
# 测试导航 API
curl http://localhost:3000/api/nav

# 应该返回：
# {"menus":[{"id":"常用推荐","type":"link",...}]}
```

### 生产环境验证
```bash
# 测试导航 API
curl https://webstackpage-next.pages.dev/api/nav

# 应该返回 JSON 数据（不是 500 错误）
```

---

## 如果还是不行

### 检查清单

- [ ] 本地开发能正常运行（`npm run dev`）
- [ ] KV 命名空间已创建（`wrangler kv:namespace list`）
- [ ] R2 存储桶已创建（Cloudflare 控制面板可见）
- [ ] Cloudflare Pages 中已添加 KV 绑定
- [ ] Cloudflare Pages 中已添加 R2 绑定
- [ ] 环境变量 `R2_PUBLIC_BASE_URL` 已设置
- [ ] 代码已推送到 GitHub（Pages 会自动部署）

### 查看错误日志

在 Cloudflare 控制面板中：
1. Pages → 您的项目 → **分析** → **日志**
2. 查看最近的部署日志
3. 搜索 "error" 或 "500"

### 常见错误

| 错误信息 | 解决方案 |
|---------|--------|
| `KV binding WEBSTACK_KV is not available` | 检查 KV 绑定是否已添加 |
| `R2 binding WEBSTACK_BUCKET is not available` | 检查 R2 绑定是否已添加 |
| `R2_PUBLIC_BASE_URL is not set` | 检查环境变量是否已设置 |
| `Unauthorized` | 检查登录密码是否正确 |

---

## 代码修改说明

已修改的文件：

1. **src/lib/storage-edge.ts**
   - 添加本地开发环境的降级方案
   - 生产环境使用 KV 和 R2
   - 本地开发使用内存缓存和 data URL

2. **src/app/api/nav/route.ts**
   - 改进错误处理和日志

3. **src/app/api/upload/route.ts**
   - 改进错误处理和日志

---

## 下一步

- 详细配置说明：查看 `DEPLOYMENT.md`
- 故障排查：查看 `TROUBLESHOOTING.md`
- 本地开发：`npm run dev`
- 管理后台：http://localhost:3000/admin（密码：admin123）

---

## 需要帮助？

如果问题仍未解决，请：

1. 查看 `TROUBLESHOOTING.md` 中的详细故障排查步骤
2. 检查 Cloudflare 控制面板中的日志
3. 确保所有绑定都已正确配置

祝您使用愉快！ 🎉

