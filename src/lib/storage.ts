// 动态按需导入 Node 模块，避免在 Cloudflare 边缘环境打包 fs/path/crypto
let _fs: typeof import('fs/promises') | null = null
let _path: typeof import('path') | null = null
let _randomUUID: (() => string) | null = null

async function getFs() {
  if (!_fs) _fs = await import('fs/promises')
  return _fs!
}
async function getPath() {
  if (!_path) _path = await import('path')
  return _path!
}
function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID()
  }
  if (!_randomUUID) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const c = require('crypto') as typeof import('crypto')
    _randomUUID = c.randomUUID
  }
  return _randomUUID!()
}

// 读取 Cloudflare Bindings（Next-on-Pages/CF Pages Functions 会注入到 globalThis.env）
function getCFEnv(): any | undefined {
  // @ts-ignore
  return (globalThis as any)?.env
}

function isCF(): boolean {
  const env = getCFEnv()
  return !!(env && (env.WEBSTACK_KV || env.WEBSTACK_BUCKET))
}

async function uploadsDir() {
  const path = await getPath()
  return path.join(process.cwd(), 'public', 'uploads')
}

async function ensureUploadsDir() {
  try {
    const fs = await getFs()
    const dir = await uploadsDir()
    await fs.mkdir(dir, { recursive: true })
  } catch {}
}

export interface NavData {
  menus: any[]
}

export const storage = {
  async getNavData(): Promise<NavData> {
    if (isCF()) {
      const env = getCFEnv()!
      const json = await env.WEBSTACK_KV.get('nav.json', { type: 'json' })
      if (json) return json as NavData
      return { menus: [] }
    }
    const fs = await getFs()
    const path = await getPath()
    const filePath = path.join(process.cwd(), 'src', 'data', 'nav.json')
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return { menus: [] }
    }
  },

  async saveNavData(data: NavData): Promise<void> {
    if (isCF()) {
      const env = getCFEnv()!
      await env.WEBSTACK_KV.put('nav.json', JSON.stringify(data), { expirationTtl: 0 })
      return
    }
    const fs = await getFs()
    const path = await getPath()
    const filePath = path.join(process.cwd(), 'src', 'data', 'nav.json')
    const pretty = JSON.stringify(data, null, 2)
    await fs.writeFile(filePath, pretty, 'utf-8')
  },

  async uploadImage(file: ArrayBuffer, filename: string): Promise<string> {
    const ext = (filename?.split('.').pop() || 'bin').toLowerCase()
    const baseName = `${randomId()}.${ext}`

    if (isCF()) {
      const env = getCFEnv()!
      const bucket = env.WEBSTACK_BUCKET as R2Bucket
      const key = `webstack/${baseName}`
      await bucket.put(key, file, {
        httpMetadata: { contentType: mimeFromExt(ext) || 'application/octet-stream' },
      })
      const base = process.env.R2_PUBLIC_BASE_URL || ''
      if (!base) return `r2://${key}`
      return joinUrl(base, key)
    }

    await ensureUploadsDir()
    const fs = await getFs()
    const path = await getPath()
    const outPath = path.join(await uploadsDir(), baseName)
    await fs.writeFile(outPath, Buffer.from(file))
    return `/uploads/${baseName}`
  },

  async deleteImage(url: string): Promise<void> {
    const key = extractKeyFromUrl(url)
    if (!key) return

    if (isCF()) {
      const env = getCFEnv()!
      const bucket = env.WEBSTACK_BUCKET as R2Bucket
      await bucket.delete(key)
      return
    }

    try {
      const fs = await getFs()
      const path = await getPath()
      const filePath = path.join(await uploadsDir(), key)
      await fs.unlink(filePath)
    } catch {}
  },
}

function joinUrl(base: string, key: string) {
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

function extractKeyFromUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith('r2://')) return url.replace('r2://', '')
  const m = url.match(/\/uploads\/(.+)$/)
  if (m) return m[1]
  try {
    const u = new URL(url)
    return u.pathname.replace(/^\//, '')
  } catch {
    return null
  }
}

function mimeFromExt(ext: string): string | undefined {
  const map: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    bmp: 'image/bmp',
    avif: 'image/avif',
  }
  return map[ext]
}

interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>
  delete: (key: string) => Promise<any>
}

