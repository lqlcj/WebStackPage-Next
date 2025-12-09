'use client'

import { useEffect, useState } from 'react'
import LayoutShell from '@/components/LayoutShell'
import { NavData } from '@/types/nav'

export default function Home() {
  const [menus, setMenus] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch('/api/nav', { cache: 'no-store' })
        if (!mounted) return
        if (res.ok) {
          const data = (await res.json()) as NavData
          setMenus(data.menus || [])
        }
      } catch {
        if (!mounted) return
        setMenus([])
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return <LayoutShell menus={menus} />
}
