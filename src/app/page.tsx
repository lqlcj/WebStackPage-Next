import dynamic from 'next/dynamic'
import { MenuItem } from '@/types/nav'
import { storage } from '@/lib/storage-edge'
import navData from '@/data/nav.json'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// 全局改为客户端渲染，避免 SSR 水合报错（放弃 SEO）
const LayoutShell = dynamic(() => import('@/components/LayoutShell'), { ssr: false })

export default async function Home() {
  // 优先读取 Cloudflare KV（若未绑定则回退本地 nav.json），确保后台保存后前台可见
  const data = await storage.getNavData().catch(() => navData)
  const menus = (data?.menus || navData.menus) as MenuItem[]
  return <LayoutShell menus={menus} />
}

