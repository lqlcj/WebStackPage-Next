export const dynamic = 'force-dynamic'

import LayoutShell from '@/components/LayoutShell'

async function getNav() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/nav`, {
      // 使用相对路径时 next-on-pages 也可工作，这里做双通道：优先绝对（可为空）
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('failed')
    return res.json()
  } catch {
    // 回退：再尝试相对路径
    const res2 = await fetch('/api/nav', { cache: 'no-store' })
    if (!res2.ok) return { menus: [] }
    return res2.json()
  }
}

export default async function Home() {
  const data = await getNav()
  return <LayoutShell menus={data.menus || []} />
}
