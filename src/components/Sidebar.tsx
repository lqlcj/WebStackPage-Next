'use client'

import { useEffect, useMemo, useState } from 'react'
import { MenuItem, CategoryLink, SubMenuFolder } from '@/types/nav'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import styles from './Sidebar.module.css'

interface SidebarProps {
  menus: MenuItem[]
  collapsed?: boolean
}

export default function Sidebar({ menus, collapsed = false }: SidebarProps) {
  // 默认折叠所有文件夹（刷新后不自动展开）
  // 使用函数初始化确保服务器端和客户端一致
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => new Set())
  const [isMounted, setIsMounted] = useState(false)

  // 所有可滚动锚点（一级分类 + 子分类）用于 ScrollSpy
  const allAnchorIds = useMemo(() => {
    const ids: string[] = []
    menus.forEach((m) => {
      if (m.type === 'link') ids.push(m.id)
      if (m.type === 'folder') m.children.forEach((c) => ids.push(c.id))
    })
    return ids
  }, [menus])
  const activeId = useScrollSpy(allAnchorIds, 120)

  // 确保只在客户端 hydration 后使用 activeId
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedFolders(newExpanded)
  }

  const isCategoryLink = (item: MenuItem): item is CategoryLink => item.type === 'link'
  const isSubMenuFolder = (item: MenuItem): item is SubMenuFolder => item.type === 'folder'

  return (
    <div className={`sidebar-menu toggle-others fixed ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-menu-inner">
        <header className="logo-env">
          <div className="logo">
            <a href="/" className="logo-expanded">
              <img src="/assets/images/logo@2x.png" width="100%" alt="WebStack Logo" />
            </a>
            <a href="/" className="logo-collapsed">
              <img src="/assets/images/logo-collapsed@2x.png" width="40" alt="WebStack Logo" />
            </a>
          </div>
          <div className="mobile-menu-toggle visible-xs">
            <a href="#" data-toggle="user-info-menu">
              <i className="linecons-cog"></i>
            </a>
            <a href="#" data-toggle="mobile-menu">
              <i className="fa-bars"></i>
            </a>
          </div>
        </header>

        <ul id="main-menu" className="main-menu">
          {menus.map((item) => {
            if (isCategoryLink(item)) {
              // 只在客户端 hydration 后使用 activeId，避免服务器端和客户端不一致
              const liClass = isMounted && activeId === item.id ? 'active' : ''
              return (
                <li key={item.id} className={liClass}>
                  <a href={`#${item.id}`} className="smooth">
                    <i className={item.icon}></i>
                    <span className="title">{item.title}</span>
                  </a>
                </li>
              )
            }

            if (isSubMenuFolder(item)) {
              const isExpanded = expandedFolders.has(item.id)
              // 只在客户端 hydration 后使用 activeId
              const anyChildActive = isMounted && item.children.some((c) => c.id === activeId)
              const liClass = `has-sub ${isExpanded ? 'opened' : ''} ${anyChildActive ? 'active' : ''}`.trim()
              return (
                <li key={item.id} className={liClass}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFolder(item.id)
                    }}
                  >
                    <i className={item.icon}></i>
                    <span className="title">{item.title}</span>
                  </a>
                  {isExpanded && (
                    <ul>
                      {item.children.map((child) => {
                        // 只在客户端 hydration 后使用 activeId
                        const childClass = isMounted && activeId === child.id ? 'active' : ''
                        return (
                          <li key={child.id} className={childClass}>
                            <a href={`#${child.id}`} className="smooth">
                              <span className="title">{child.title}</span>
                              {child.title === '网页灵感' && (
                                <span className="label label-pink pull-right hidden-collapsed">Hot</span>
                              )}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            }

            return null
          })}

          <li>
            <a href="#关于本站" className="smooth">
              <i className="linecons-heart"></i>
              <span className="tooltip-blue">关于本站</span>
              <span className="label label-Primary pull-right hidden-collapsed">♥︎</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

