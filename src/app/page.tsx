import LayoutShell from '@/components/LayoutShell'
import navData from '@/data/nav.json'
import { MenuItem } from '@/types/nav'

export default function Home() {
  const menus = navData.menus as MenuItem[]
  return <LayoutShell menus={menus} />
}

