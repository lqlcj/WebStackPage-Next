// Edge-safe storage adapter (Cloudflare KV + R2). No Node.js builtins.
// Used by Edge runtime routes on Cloudflare Pages via next-on-pages.

export interface NavData { menus: any[] }

function getEnv(): any | undefined {
  // Cloudflare Pages Functions injects bindings into globalThis.env
  // @ts-ignore
  return (globalThis as any)?.env
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
    if (env?.WEBSTACK_KV) {
      const json = await env.WEBSTACK_KV.get('nav.json', { type: 'json' })
      if (json) return json as NavData
      return { menus: [] }
    }
    // No KV in Edge local/dev: fall back to static import (read-only)
    const fallback = (await import('@/data/nav.json')).default as NavData
    return fallback
  },

  async saveNavData(data: NavData): Promise<void> {
    const env = getEnv()
    if (env?.WEBSTACK_KV) {
      await env.WEBSTACK_KV.put('nav.json', JSON.stringify(data))
      return
    }
    // Edge 本地无 KV 时不可持久化：静默丢弃（或抛错由你决定）。
    // throw new Error('KV not available in this environment')
  },

  async uploadImage(file: ArrayBuffer, filename: string): Promise<string> {
    const ext = (filename?.split('.').pop() || 'bin').toLowerCase()
    const baseName = `${randomId()}.${ext}`
    const env = getEnv()

    if (env?.WEBSTACK_BUCKET) {
      const key = `webstack/${baseName}`
      await (env.WEBSTACK_BUCKET as R2Bucket).put(key, file, {
        httpMetadata: { contentType: mimeFromExt(ext) || 'application/octet-stream' },
      })
      const base = process.env.R2_PUBLIC_BASE_URL || ''
      if (!base) return `r2://${key}`
      return joinUrl(base, key)
    }

    // Edge 本地无 R2：返回占位 r2:// 路径（不可访问），便于链路测试
    return `r2://webstack/${baseName}`
  },

  async deleteImage(url: string): Promise<void> {
    const env = getEnv()
    const key = extractKeyFromUrl(url)
    if (!key) return
    if (env?.WEBSTACK_BUCKET) {
      await (env.WEBSTACK_BUCKET as R2Bucket).delete(key)
    }
    // 无 R2 时忽略
  },
}

interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>
  delete: (key: string) => Promise<any>
}

