# KV 写入问题排查指南

## 问题描述
后台系统保存后，KV 空间没有数据写入，前台没有数据。

## 已实施的修复

### 1. 添加了详细的错误处理和日志
- 在 `src/lib/storage-edge.ts` 的 `saveNavData` 函数中添加了：
  - 环境变量检查日志
  - KV 写入前的验证
  - 写入后的验证检查
  - 详细的错误信息

### 2. 改进了环境变量获取
- `getEnv()` 函数现在尝试多种方式获取环境变量：
  - `globalThis.env` (Next.js on Pages 可能使用)
  - `globalThis.WEBSTACK_KV` (直接检查)
  - `__CF_PAGES_CONTEXT__` (Cloudflare Pages Functions 标准方式)
  - `process.env` (某些情况下可能可用)

### 3. 添加了诊断功能
- 新增 `diagnoseEnv()` 函数，可以检查环境变量是否可用
- 在 API 路由中添加了诊断日志输出

## 排查步骤

### 步骤 1: 检查 Cloudflare Pages 绑定配置

1. 登录 Cloudflare 仪表板
2. 进入 **Workers & Pages** > 选择您的项目
3. 进入 **设置** > **Functions**
4. 检查 **KV 命名空间绑定**：
   - 变量名必须是：`WEBSTACK_KV`
   - KV 命名空间必须选择：`WEBSTACK_KV`
5. 检查 **R2 存储桶绑定**：
   - 变量名必须是：`WEBSTACK_BUCKET`
   - R2 存储桶必须选择：`blog-images`

### 步骤 2: 查看部署日志

部署后，查看 Cloudflare Pages 的实时日志：

```bash
# 使用 wrangler 查看日志
wrangler pages deployment tail

# 或者通过 Cloudflare 仪表板查看
# Workers & Pages > 您的项目 > 部署 > 选择最新部署 > 查看日志
```

查找以下日志信息：
- `[Storage] saveNavData called`
- `[Storage] env exists: true/false`
- `[Storage] env.WEBSTACK_KV exists: true/false`
- `[API /nav POST] Environment diagnosis:`

### 步骤 3: 验证 KV 命名空间

1. 在 Cloudflare 仪表板中，进入 **Workers & Pages** > **KV**
2. 找到 `WEBSTACK_KV` 命名空间
3. 检查是否有 `nav.json` 键
4. 如果没有，说明写入确实失败了

### 步骤 4: 检查代码日志输出

保存数据后，检查日志中是否有以下信息：

**成功的情况应该看到：**
```
[API /nav POST] Request received
[API /nav POST] Environment diagnosis: { "envAvailable": true, "kvAvailable": true, ... }
[Storage] saveNavData called
[Storage] env exists: true
[Storage] env.WEBSTACK_KV exists: true
[Storage] Attempting to save to KV, data size: XXXX bytes
[Storage] ✓ Successfully saved to KV, verified size: XXXX bytes
[API /nav POST] ✓ Save completed successfully
```

**失败的情况可能看到：**
```
[API /nav POST] Environment diagnosis: { "envAvailable": false, "kvAvailable": false, ... }
[Storage] No env found via any method
[Storage] WARNING: WEBSTACK_KV not available, using local cache only
```

### 步骤 5: 常见问题排查

#### 问题 1: `env.WEBSTACK_KV exists: false`

**原因：** KV 绑定没有正确配置或没有传递到 Edge Runtime

**解决方案：**
1. 确认在 Cloudflare Pages 设置中，KV 绑定的变量名是 `WEBSTACK_KV`（大小写敏感）
2. 重新部署项目
3. 确认使用的是生产环境，不是预览环境

#### 问题 2: `KV write appeared to succeed but verification failed`

**原因：** KV 写入操作返回成功，但实际数据没有保存

**解决方案：**
1. 检查 KV 命名空间的配额是否已满
2. 检查是否有权限问题
3. 尝试手动在 KV 中创建 `nav.json` 键，看看是否有权限限制

#### 问题 3: `No env found via any method`

**原因：** 环境变量没有传递到 Edge Runtime

**解决方案：**
1. 确认使用的是 Edge Runtime（代码中已有 `export const runtime = 'edge'`）
2. 检查 Next.js on Pages 适配器是否正确配置
3. 确认项目是通过 `@cloudflare/next-on-pages` 构建的

## 手动测试 KV 写入

如果自动写入失败，可以尝试手动测试：

1. 在 Cloudflare 仪表板中，进入 **Workers & Pages** > **KV**
2. 选择 `WEBSTACK_KV` 命名空间
3. 手动创建键 `nav.json`
4. 复制本地 `src/data/nav.json` 的内容作为值
5. 保存后，刷新前台页面，看是否能读取到数据

## 临时解决方案

如果 KV 写入持续失败，可以：

1. 使用本地文件作为数据源（开发环境）
2. 考虑使用 R2 存储 JSON 文件作为替代方案
3. 检查是否需要升级 Cloudflare 计划（某些计划可能限制 KV 使用）

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. Cloudflare Pages 部署日志（包含 `[Storage]` 和 `[API /nav POST]` 的日志）
2. 环境诊断信息（从日志中的 `Environment diagnosis` 部分）
3. Cloudflare Pages 设置截图（Functions 绑定部分）
4. KV 命名空间截图

