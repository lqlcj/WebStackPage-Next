export const runtime = 'edge'
export const dynamic = 'force-dynamic'

import LayoutShell from '@/components/LayoutShell'

export default async function Home() {
  // 在 Edge Runtime 下，使用相对路径从同域 API 拉取最新导航数据
  const res = await fetch('/api/nav', { cache: 'no-store' })
  const data = res.ok ? await res.json() : { menus: [] }
  return <LayoutShell menus={data.menus || []} />
}
