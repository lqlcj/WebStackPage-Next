import { useEffect } from 'react'

/**
 * 自定义 Hook: useSmoothScroll
 * 处理平滑滚动功能（事件委托 + 最近可点击祖先）
 */
export function useSmoothScroll() {
  useEffect(() => {
    const handleSmoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      // 查找最近的 a.smooth 祖先，解决点到 span 等子元素无效的问题
      const link = target.closest('a.smooth') as HTMLAnchorElement | null
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || !href.startsWith('#')) return

      e.preventDefault()
      const id = href.substring(1)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    document.addEventListener('click', handleSmoothScroll)
    return () => document.removeEventListener('click', handleSmoothScroll)
  }, [])
}
