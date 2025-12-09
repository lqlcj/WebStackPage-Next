'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { MenuItem } from '@/types/nav'

interface LayoutShellProps {
  menus: MenuItem[]
}

export default function LayoutShell({ menus }: LayoutShellProps) {
  // 由于线上出现 hydration 418/423，先在客户端挂载完成后再渲染主体
  // 这样可避免服务端/客户端 DOM 不一致导致的报错
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)

  if (!mounted) {
    // 保持容器结构，避免闪烁
    return <div className="page-container" />
  }

  return (
    <div className="page-container">
      {/* 注意：保持原 HTML 结构与类名，collapsed 只加在 sidebar-menu 上 */}
      <Sidebar menus={menus} collapsed={sidebarCollapsed} />
      <MainContent menus={menus} onToggleSidebar={toggleSidebar} />
    </div>
  )
}

