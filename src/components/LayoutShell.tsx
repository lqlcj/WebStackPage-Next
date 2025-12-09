'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/Sidebar'
import MainContent from '@/components/MainContent'
import { MenuItem } from '@/types/nav'

interface LayoutShellProps {
  menus: MenuItem[]
}

export default function LayoutShell({ menus }: LayoutShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed((v) => !v)

  return (
    <div className="page-container">
      {/* 注意：保持原 HTML 结构与类名，collapsed 只加在 sidebar-menu 上 */}
      <Sidebar menus={menus} collapsed={sidebarCollapsed} />
      <MainContent menus={menus} onToggleSidebar={toggleSidebar} />
    </div>
  )
}

