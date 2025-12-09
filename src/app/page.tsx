import LayoutShell from '@/components/LayoutShell'
import navData from '@/data/nav.json'

export default function Home() {
  return <LayoutShell menus={navData.menus} />
}

