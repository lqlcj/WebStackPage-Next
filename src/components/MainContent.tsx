'use client'

import { MenuItem, CategoryLink, SubMenuFolder } from '@/types/nav'
import SiteCard from './SiteCard'
import AboutSection from './AboutSection'
import { useSmoothScroll } from '@/hooks/useSmoothScroll'

interface MainContentProps {
  menus: MenuItem[]
  onToggleSidebar?: () => void
}

export default function MainContent({ menus, onToggleSidebar }: MainContentProps) {
  // 启用全局平滑滚动（支持 a.smooth 的任意子元素点击）
  useSmoothScroll()

  const isCategoryLink = (item: MenuItem): item is CategoryLink => item.type === 'link'
  const isSubMenuFolder = (item: MenuItem): item is SubMenuFolder => item.type === 'folder'

  const renderCategory = (category: CategoryLink) => (
    <div key={category.id}>
      <h4 className="text-gray">
        <i className="linecons-tag" style={{ marginRight: '7px' }} id={category.id}></i>
        {category.title}
      </h4>
      <div className="row">
        {category.items.map((site, index) => (
          <div key={index} className="col-sm-3">
            <SiteCard site={site} />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="main-content">
      <nav className="navbar user-info-navbar" role="navigation">
        <ul className="user-info-menu left-links list-inline list-unstyled">
          <li className="hidden-sm hidden-xs">
            <a href="#" data-toggle="sidebar" onClick={(e) => { e.preventDefault(); onToggleSidebar?.(); }}>
              <i className="fa-bars"></i>
            </a>
          </li>

        </ul>
        <ul className="user-info-menu right-links list-inline list-unstyled">
          <li className="hidden-sm hidden-xs">
            <a href="#关于本站" className="smooth">
              <i className="linecons-heart"></i> About
            </a>
          </li>
        </ul>
      </nav>

      {menus.map((item) => {
        if (isCategoryLink(item)) return renderCategory(item)
        if (isSubMenuFolder(item)) {
          return <div key={item.id}>{item.children.map((child) => renderCategory(child))}</div>
        }
        return null
      })}

      {/* 关于本站区块（合并为首页右侧内容） */}
      <AboutSection />
    </div>
  )
}

