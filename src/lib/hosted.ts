export function getPublicBase(): string {
  if (typeof process !== 'undefined') {
    return process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || ''
  }
  // @ts-ignore
  return (globalThis as any)?.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || ''
}

export function isHostedLogo(url?: string | null): boolean {
  if (!url) return false
  const base = getPublicBase()
  if (url.startsWith('/uploads/')) return true
  if (url.startsWith('r2://')) return true
  if (base && url.startsWith(base)) return true
  return false
}

