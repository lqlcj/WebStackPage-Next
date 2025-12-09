import LayoutShell from '@/components/LayoutShell'
import { MenuItem } from '@/types/nav'
import { storage } from '@/lib/storage-edge'
import navData from '@/data/nav.json'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default async function Home() {
  // 优先读取 Cloudflare KV（若未绑定则回退本地 nav.json），确保后台保存后前台可见
  const data = await storage.getNavData().catch(() => navData)
  const menus = (data?.menus || navData.menus) as MenuItem[]
  return <LayoutShell menus={menus} />
}

