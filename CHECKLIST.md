# 配置检查清单

## 本地开发环境 ✅

- [ ] 已安装 Node.js 和 npm
- [ ] 已运行 `npm install`
- [ ] 已运行 `npm run dev`
- [ ] 首页能加载（http://localhost:3000）
- [ ] 管理后台能访问（http://localhost:3000/admin）
- [ ] 默认密码 `admin123` 能登录
- [ ] 能查看导航数据
- [ ] 能编辑导航数据
- [ ] 能上传图片（显示为 data URL）
- [ ] 能保存数据到内存缓存

**验证命令**：
```bash
npm run dev
curl http://localhost:3000/api/nav
```

---

## Cloudflare 账户准备 ✅

- [ ] 已注册 Cloudflare 账户
- [ ] 已登录 Cloudflare 控制面板
- [ ] 已找到 Account ID（设置 → 账户）
- [ ] 已安装 Wrangler CLI：`npm install -g wrangler`
- [ ] 已登录 Wrangler：`wrangler login`

**验证命令**：
```bash
wrangler whoami
```

---

## KV 命名空间配置 ✅

- [ ] 已创建 KV 命名空间：`wrangler kv:namespace create "WEBSTACK_KV"`
- [ ] 已创建预览命名空间：`wrangler kv:namespace create "WEBSTACK_KV" --preview`
- [ ] 已记下 KV ID（例如：`abc123...`）
- [ ] 已记下 KV 预览 ID（例如：`def456...`）

**验证命令**：
```bash
wrangler kv:namespace list
```

**预期输出**：
```
┌─────────────────────────────────────────────────────────┐
│ id                                                      │
├─────────────────────────────────────────────────────────┤
│ abc123...                                               │
└─────────────────────────────────────────────────────────┘
```

---

## R2 存储桶配置 ✅

- [ ] 已登录 Cloudflare 控制面板
- [ ] 已进入 R2 → 创建存储桶
- [ ] 已创建名为 `webstack` 的存储桶
- [ ] 已记下公共 URL（例如：`https://photo.lcjlq.com`）
- [ ] 已设置存储桶权限允许公开访问

**验证步骤**：
1. 登录 Cloudflare 控制面板
2. R2 → 存储桶 → `webstack`
3. 检查"权限"设置

---

## Cloudflare Pages 绑定配置 ✅

### KV 绑定
- [ ] 已进入 Pages → 您的项目 → 设置 → 函数
- [ ] 已点击"添加绑定"
- [ ] 已设置变量名：`WEBSTACK_KV`
- [ ] 已选择 KV 命名空间：`WEBSTACK_KV`
- [ ] 已保存绑定

### R2 绑定
- [ ] 已点击"添加绑定"
- [ ] 已设置变量名：`WEBSTACK_BUCKET`
- [ ] 已选择 R2 存储桶：`webstack`
- [ ] 已保存绑定

**验证步骤**：
1. 登录 Cloudflare 控制面板
2. Pages → 您的项目 → 设置 → 函数
3. 应该看到两个绑定：`WEBSTACK_KV` 和 `WEBSTACK_BUCKET`

---

## 环境变量配置 ✅

- [ ] 已进入 Pages → 您的项目 → 设置 → 环境变量
- [ ] 已添加变量：
  - 名称：`R2_PUBLIC_BASE_URL`
  - 值：`https://photo.lcjlq.com`（替换为您的 R2 公共 URL）
  - 环境：生产和预览
- [ ] 已保存环境变量

**验证步骤**：
1. 登录 Cloudflare 控制面板
2. Pages → 您的项目 → 设置 → 环境变量
3. 应该看到 `R2_PUBLIC_BASE_URL` 变量

---

## 代码部署 ✅

- [ ] 已修改的代码已提交到 Git
  ```bash
  git add .
  git commit -m "Fix API 500 errors with Cloudflare KV and R2 configuration"
  ```
- [ ] 已推送到 GitHub
  ```bash
  git push origin main
  ```
- [ ] Cloudflare Pages 已自动部署（等待 2-3 分钟）
- [ ] 部署状态显示为"成功"

**验证步骤**：
1. 登录 Cloudflare 控制面板
2. Pages → 您的项目 → 部署
3. 应该看到最新的部署状态为"成功"

---

## 功能验证 ✅

### 导航数据 API
- [ ] 访问 `/api/nav` 返回 JSON 数据（不是 500 错误）
- [ ] 数据包含 `menus` 数组
- [ ] 数据结构正确

**测试命令**：
```bash
curl https://webstackpage-next.pages.dev/api/nav
```

**预期输出**：
```json
{
  "menus": [
    {
      "id": "常用推荐",
      "type": "link",
      "title": "常用推荐",
      "icon": "linecons-star",
      "items": [...]
    }
  ]
}
```

### 首页加载
- [ ] 访问首页能看到导航菜单
- [ ] 菜单项能正常显示
- [ ] 图片能正常加载

**测试步骤**：
1. 访问 https://webstackpage-next.pages.dev
2. 应该看到导航菜单和网站列表

### 管理后台
- [ ] 访问 `/admin` 能看到登录表单
- [ ] 使用密码登录成功
- [ ] 能看到导航数据
- [ ] 能编辑导航数据
- [ ] 能保存数据到 KV

**测试步骤**：
1. 访问 https://webstackpage-next.pages.dev/admin
2. 输入密码登录
3. 应该看到导航编辑界面

### 图片上传
- [ ] 能上传图片到 R2
- [ ] 上传后返回正确的 URL
- [ ] 图片能在浏览器中显示

**测试步骤**：
1. 在管理后台编辑一个网站
2. 点击"上传"按钮
3. 选择一个图片文件
4. 应该看到上传成功，图片 URL 被填充

---

## 故障排查 ✅

如果以上任何步骤失败，请：

1. **检查日志**
   - Cloudflare 控制面板 → Pages → 您的项目 → 分析 → 日志
   - 查看错误信息

2. **检查绑定**
   - 确保 KV 绑定变量名是 `WEBSTACK_KV`
   - 确保 R2 绑定变量名是 `WEBSTACK_BUCKET`
   - 确保环境变量 `R2_PUBLIC_BASE_URL` 已设置

3. **检查权限**
   - 确保 R2 存储桶权限允许公开访问
   - 确保 KV 命名空间权限正确

4. **重新部署**
   - 在 Cloudflare 控制面板中手动触发部署
   - 或推送新的代码更改

5. **查看文档**
   - 详细配置：`DEPLOYMENT.md`
   - 故障排查：`TROUBLESHOOTING.md`
   - 快速修复：`QUICK_FIX.md`

---

## 完成标记

当所有项目都完成时，您可以：

```
✅ 本地开发环境正常工作
✅ Cloudflare KV 已配置
✅ Cloudflare R2 已配置
✅ Cloudflare Pages 绑定已配置
✅ 环境变量已设置
✅ 代码已部署
✅ 所有功能已验证
```

**恭喜！您的网站现在应该能正常工作了！** 🎉

---

## 后续维护

- [ ] 定期检查 Cloudflare 日志
- [ ] 监控 KV 和 R2 的使用情况
- [ ] 备份重要的导航数据
- [ ] 更新依赖包：`npm update`

---

## 联系支持

如果遇到问题，请：
1. 查看 `TROUBLESHOOTING.md`
2. 检查 Cloudflare 控制面板的日志
3. 查看本项目的 GitHub Issues

