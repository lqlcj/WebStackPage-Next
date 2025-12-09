import dynamic from 'next/dynamic'
import navData from '@/data/nav.json'

// 关闭 SSR，避免 Cloudflare 环境下因服务端/客户端 DOM 不一致导致的 hydration 报错 418/423
const LayoutShell = dynamic(() => import('@/components/LayoutShell'), {
  ssr: false,
  loading: () => <div className="page-container" />,
})

export default function Home() {
  return <LayoutShell menus={navData.menus} />
}

