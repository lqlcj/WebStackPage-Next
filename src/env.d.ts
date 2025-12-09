// Cloudflare Bindings 类型声明（用于 Cloudflare Pages Functions / Next on Pages 场景）
// 仅做最小声明，避免 TS 报错；运行时由平台注入

interface KVNamespace {
  get: (key: string, opts?: { type: 'text' | 'json' | 'arrayBuffer' }) => Promise<any>
  put: (key: string, value: string | ArrayBuffer | ReadableStream, opts?: any) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface R2Bucket {
  put: (key: string, value: any, options?: { httpMetadata?: { contentType?: string } }) => Promise<any>
  delete: (key: string) => Promise<any>
}

interface Env {
  WEBSTACK_KV: KVNamespace
  WEBSTACK_BUCKET: R2Bucket
}

declare global {
  // Cloudflare Pages Functions 会把 bindings 注入到 globalThis.env
  // 这里声明以便在 TypeScript 中访问 (globalThis as any).env
  // 实际访问请使用 (globalThis as any).env 或在运行时检测
  // 注意：在本地 Node.js 环境中该变量不存在
  // eslint-disable-next-line no-var
  var env: Env | undefined
}

export {}

