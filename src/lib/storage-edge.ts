// Edge-safe storage adapter (Cloudflare KV + R2). No Node.js builtins.
// Used by Edge runtime routes on Cloudflare Pages via next-on-pages.

export interface NavData { menus: any[] }

function getEnv(): any | undefined {
  // Cloudflare Pages Functions injects bindings into globalThis.env
  // @ts-ignore
  return (globalThis as any)?.env
}

function getPublicBase(): string {
  // Read from CF Bindings first (runtime)
  const env = getEnv()
  const fromEnvBinding = env?.R2_PUBLIC_BASE_URL || env?.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  if (fromEnvBinding) return String(fromEnvBinding)
  // Then try process.env (may be undefined at runtime)
  // @ts-ignore
  const pe: any = typeof process !== 'undefined' ? (process as any).env : undefined
  const fromProcess = pe?.R2_PUBLIC_BASE_URL || pe?.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  if (fromProcess) return String(fromProcess)
  // Finally try globals (if injected by adapter)
  // @ts-ignore
  const g: any = (globalThis as any)
  const fromGlobal = g.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || g.R2_PUBLIC_BASE_URL
  if (fromGlobal) return String(fromGlobal)
  // Final hard fallback (project-specific)
  return 'https://photo.lcjlq.com'
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID()
  }
  // Fallback UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
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

function joinUrl(base: string, key: string) {
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

function extractKeyFromUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith('r2://')) return url.replace('r2://', '')
  try {
    const u = new URL(url)
    // e.g. https://photo.example.com/webstack/uuid.png -> webstack/uuid.png
    return u.pathname.replace(/^\//, '')
  } catch {
    return null
  }
}

export const storage = {
  async getNavData(): Promise<NavData> {
    const env = getEnv()
    if (!env?.WEBSTACK_KV) {
      // 明确无 KV 绑定，返回空结构（避免混用本地文件导致线上不同步）
      return { menus: [] }
    }
    const json = await env.WEBSTACK_KV.get('nav.json', { type: 'json' })
    if (json) return json as NavData
    return { menus: [] }
  },

  async saveNavData(data: NavData): Promise<void> {
    const env = getEnv()
    if (!env?.WEBSTACK_KV) {
      // 直接抛错，让 /api/nav 返回 500，前端能看到“保存失败：缺少 KV 绑定”
      throw new Error('KV binding WEBSTACK_KV is not available in this environment')
    }
    await env.WEBSTACK_KV.put('nav.json', JSON.stringify(data))
  },

  async uploadImage(file: ArrayBuffer, filename: string): Promise<string> {
    const env = getEnv()
    if (!env?.WEBSTACK_BUCKET) {
      throw new Error('R2 binding WEBSTACK_BUCKET is not available in this environment')
    }

    const ext = (filename?.split('.').pop() || 'bin').toLowerCase()
    const baseName = `${randomId()}.${ext}`
    const key = `webstack/${baseName}`

    await (env.WEBSTACK_BUCKET as R2Bucket).put(key, file, {
      httpMetadata: { contentType: mimeFromExt(ext) || 'application/octet-stream' },
    })

    const base = getPublicBase()
    if (!base) {
      // 不再返回 r2://，而是直接抛错让前端提示配置问题
      throw new Error('R2_PUBLIC_BASE_URL (or NEXT_PUBLIC_R2_PUBLIC_BASE_URL) is not set')
    }
    return joinUrl(base, key)
  },

  async deleteImage(url: string): Promise<void> {
    const env = getEnv()
    if (!env?.WEBSTACK_BUCKET) return
    const key = extractKeyFromUrl(url)
    if (!key) return
    await (env.WEBSTACK_BUCKET as R2Bucket).delete(key)
  },
}

interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>
  delete: (key: string) => Promise<any>
}
