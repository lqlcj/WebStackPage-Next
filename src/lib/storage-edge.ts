// Edge-safe storage adapter (Cloudflare KV + R2). No Node.js builtins.
// Used by Edge runtime routes on Cloudflare Pages via next-on-pages.
// Fallback to local file system for development.

export interface NavData { menus: any[] }

function getEnv(): any | undefined {
  // 尝试多种方式获取 Cloudflare 环境变量
  // 方式1: globalThis.env (Next.js on Pages 可能使用)
  // @ts-ignore
  if ((globalThis as any)?.env) {
    // @ts-ignore
    const env = (globalThis as any).env
    console.log('[Storage] Found env via globalThis.env')
    return env
  }
  
  // 方式2: globalThis (直接检查)
  // @ts-ignore
  if ((globalThis as any)?.WEBSTACK_KV) {
    console.log('[Storage] Found WEBSTACK_KV directly on globalThis')
    // @ts-ignore
    return globalThis as any
  }
  
  // 方式3: 检查是否有 context 对象（Cloudflare Pages Functions 标准方式）
  // 注意：在 Next.js Edge Runtime 中，context 可能通过其他方式传递
  // @ts-ignore
  if (typeof globalThis !== 'undefined' && (globalThis as any).__CF_PAGES_CONTEXT__) {
    // @ts-ignore
    const context = (globalThis as any).__CF_PAGES_CONTEXT__
    if (context?.env) {
      console.log('[Storage] Found env via __CF_PAGES_CONTEXT__')
      return context.env
    }
  }
  
  // 方式4: 检查 process.env（某些情况下可能可用）
  // @ts-ignore
  if (typeof process !== 'undefined' && (process as any).env) {
    // @ts-ignore
    const pe = (process as any).env
    // 注意：KV 绑定通常不会在 process.env 中，但我们可以检查
    if (pe.WEBSTACK_KV || pe.WEBSTACK_BUCKET) {
      console.log('[Storage] Found bindings via process.env (unusual)')
      return pe
    }
  }
  
  console.log('[Storage] No env found via any method')
  console.log('[Storage] globalThis keys:', typeof globalThis !== 'undefined' ? Object.keys(globalThis).slice(0, 10) : 'undefined')
  return undefined
}

// 本地开发环境的内存存储（临时）
let localNavCache: NavData | null = null

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

// 诊断函数：检查环境变量是否可用
export function diagnoseEnv(): {
  envAvailable: boolean
  kvAvailable: boolean
  bucketAvailable: boolean
  details: any
} {
  const env = getEnv()
  const result = {
    envAvailable: !!env,
    kvAvailable: !!env?.WEBSTACK_KV,
    bucketAvailable: !!env?.WEBSTACK_BUCKET,
    details: {
      envType: env ? typeof env : 'undefined',
      envKeys: env ? Object.keys(env).slice(0, 20) : [],
      kvType: env?.WEBSTACK_KV ? typeof env.WEBSTACK_KV : 'undefined',
      bucketType: env?.WEBSTACK_BUCKET ? typeof env.WEBSTACK_BUCKET : 'undefined',
      globalThisKeys: typeof globalThis !== 'undefined' ? Object.keys(globalThis).filter(k => k.includes('env') || k.includes('KV') || k.includes('BUCKET')).slice(0, 10) : [],
    }
  }
  return result
}

export const storage = {
  async getNavData(): Promise<NavData> {
    const env = getEnv()
    
    if (env?.WEBSTACK_KV) {
      try {
        // 生产环境：使用 Cloudflare KV
        console.log('[Storage] Reading from KV...')
        const json = await env.WEBSTACK_KV.get('nav.json', { type: 'json' })
        if (json) {
          console.log('[Storage] ✓ Successfully read from KV, menus count:', (json as NavData)?.menus?.length || 0)
          return json as NavData
        }
        console.log('[Storage] No data found in KV, returning empty menus')
        return { menus: [] }
      } catch (error: any) {
        console.error('[Storage] ✗ Failed to read from KV:', error?.message || error)
        return { menus: [] }
      }
    }
    
    console.log('[Storage] WEBSTACK_KV not available, using local fallback')
    
    // 本地开发环境：使用内存缓存或从 nav.json 文件读取
    if (localNavCache) {
      console.log('[Storage] Using local cache, menus count:', localNavCache.menus?.length || 0)
      return localNavCache
    }
    
    // 尝试从本地 nav.json 文件读取（仅在开发环境）
    try {
      // @ts-ignore
      if (typeof require !== 'undefined') {
        const navData = require('@/data/nav.json')
        localNavCache = navData
        console.log('[Storage] Loaded from local file, menus count:', navData?.menus?.length || 0)
        return navData
      }
    } catch (error: any) {
      console.log('[Storage] Could not load from local file:', error?.message || 'file not found')
    }
    
    console.log('[Storage] Returning empty menus')
    return { menus: [] }
  },

  async saveNavData(data: NavData): Promise<void> {
    const env = getEnv()
    
    // 详细日志：检查环境变量
    console.log('[Storage] saveNavData called')
    console.log('[Storage] env exists:', !!env)
    console.log('[Storage] env.WEBSTACK_KV exists:', !!env?.WEBSTACK_KV)
    console.log('[Storage] env keys:', env ? Object.keys(env) : 'no env')
    
    if (env?.WEBSTACK_KV) {
      try {
        // 生产环境：保存到 Cloudflare KV
        const jsonString = JSON.stringify(data)
        console.log('[Storage] Attempting to save to KV, data size:', jsonString.length, 'bytes')
        console.log('[Storage] KV namespace type:', typeof env.WEBSTACK_KV)
        console.log('[Storage] KV put method exists:', typeof env.WEBSTACK_KV.put === 'function')
        
        await env.WEBSTACK_KV.put('nav.json', jsonString)
        
        // 验证写入是否成功
        const verify = await env.WEBSTACK_KV.get('nav.json', { type: 'text' })
        if (verify) {
          console.log('[Storage] ✓ Successfully saved to KV, verified size:', verify.length, 'bytes')
        } else {
          console.error('[Storage] ✗ KV write appeared to succeed but verification failed!')
          throw new Error('KV write verification failed: data was not saved')
        }
      } catch (error: any) {
        console.error('[Storage] ✗ Failed to save to KV:', error?.message || error)
        console.error('[Storage] Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        })
        throw new Error(`Failed to save to KV: ${error?.message || 'Unknown error'}`)
      }
    } else {
      // 本地开发环境：保存到内存缓存
      localNavCache = data
      console.log('[Storage] Data saved to local cache (development mode)')
      console.warn('[Storage] WARNING: WEBSTACK_KV not available, using local cache only')
    }
  },

  async uploadImage(file: ArrayBuffer, filename: string): Promise<string> {
    const env = getEnv()
    if (env?.WEBSTACK_BUCKET) {
      // 生产环境：上传到 R2
      const ext = (filename?.split('.').pop() || 'bin').toLowerCase()
      const baseName = `${randomId()}.${ext}`
      const key = `webstack/${baseName}`

      await (env.WEBSTACK_BUCKET as R2Bucket).put(key, file, {
        httpMetadata: { contentType: mimeFromExt(ext) || 'application/octet-stream' },
      })

      const base = getPublicBase()
      if (!base) {
        throw new Error('R2_PUBLIC_BASE_URL (or NEXT_PUBLIC_R2_PUBLIC_BASE_URL) is not set')
      }
      return joinUrl(base, key)
    }
    
    // 本地开发环境：返回 data URL（用于本地测试）
    try {
      const base64 = Buffer.from(file).toString('base64')
      const ext = filename?.split('.').pop() || 'bin'
      const mimeType = mimeFromExt(ext) || 'application/octet-stream'
      return `data:${mimeType};base64,${base64}`
    } catch {
      throw new Error('Upload failed: Unable to create data URL')
    }
  },

  async deleteImage(url: string): Promise<void> {
    const env = getEnv()
    if (env?.WEBSTACK_BUCKET) {
      // 生产环境：从 R2 删除
      const key = extractKeyFromUrl(url)
      if (!key) return
      await (env.WEBSTACK_BUCKET as R2Bucket).delete(key)
    }
    // 本地开发环境：无需删除 data URL
  },
}

interface R2Bucket {
  put: (key: string, value: any, options?: any) => Promise<any>
  delete: (key: string) => Promise<any>
}
