export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import LayoutShell from '@/components/LayoutShell'
import { headers } from 'next/headers'

function buildBaseUrl() {
  const h = headers()
  const proto =
    h.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'production' ? 'https' : 'http')
  const host = h.get('host') ?? 'localhost:3000'
  return `${proto}://${host}`
}

export default async function Home() {
  const base = buildBaseUrl()

  let data: any = { menus: [] }
  try {
    // 使用绝对 URL，Edge + 本地都稳定
    const res = await fetch(`${base}/api/nav`, { cache: 'no-store' })
    if (res.ok) {
      data = await res.json()
    }
  } catch {
    // 保底避免 500
    data = { menus: [] }
  }

  return <LayoutShell menus={data.menus || []} />
}
