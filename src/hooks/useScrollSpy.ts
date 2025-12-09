import { useEffect, useState } from 'react'

/**
 * 根据页面滚动高亮当前锚点（仿 ScrollSpy）
 * 修复 hydration mismatch：确保服务器端和客户端初始渲染一致
 */
export function useScrollSpy(ids: string[], offset = 120) {
  // 初始状态：服务器端和客户端都使用空字符串，确保完全一致
  // 只有在客户端 hydration 完成后才设置实际值
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 标记为已挂载，只在客户端执行
    setMounted(true)
  }, [])

  useEffect(() => {
    // 只有在客户端挂载后才执行
    if (!mounted || typeof window === 'undefined' || !ids.length) return

    // 确保 DOM 已加载
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (!elements.length) {
      // 如果没有找到元素，使用第一个 ID 作为默认值
      if (ids[0]) {
        setActiveId(ids[0])
      }
      return
    }

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

    // 初始设置（在客户端 hydration 后）
    handler()
    
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [ids, offset, mounted])

  // 在服务器端和客户端 hydration 完成前，始终返回空字符串
  return mounted ? activeId : ''
}

