import { useEffect, useState, useLayoutEffect } from 'react'

/**
 * 根据页面滚动高亮当前锚点（仿 ScrollSpy）
 * 修复 hydration mismatch：确保服务器端和客户端初始渲染一致
 */
export function useScrollSpy(ids: string[], offset = 120) {
  // 初始状态：服务器端和客户端都使用第一个 ID（如果存在）
  // 这样可以确保初始渲染一致
  const [activeId, setActiveId] = useState<string>(ids[0] || '')
  const [mounted, setMounted] = useState(false)

  // 使用 useLayoutEffect 在 DOM 更新后同步执行，避免闪烁
  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !ids.length) return

    // 确保 DOM 已加载
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (!elements.length) {
      // 如果没有找到元素，保持初始值
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

  return activeId
}

