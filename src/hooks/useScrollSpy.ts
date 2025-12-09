import { useEffect, useState } from 'react'

/**
 * 根据页面滚动高亮当前锚点（仿 ScrollSpy）
 */
export function useScrollSpy(ids: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>(ids[0] || '')

  useEffect(() => {
    if (!ids.length) return

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (!elements.length) return

    const handler = () => {
      const scrollY = window.scrollY + offset
      // 找到最接近顶部的可见 section
      let current = elements[0].id
      for (const el of elements) {
        if (el.offsetTop <= scrollY) current = el.id
        else break
      }
      setActiveId(current)
    }

    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [ids, offset])

  return activeId
}

