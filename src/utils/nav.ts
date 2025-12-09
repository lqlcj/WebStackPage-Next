import { MenuItem, CategoryLink, SubMenuFolder, Site } from '@/types/nav'

/**
 * 导航数据工具函数
 */

/**
 * 检查是否是分类链接1
 */
export function isCategoryLink(item: MenuItem): item is CategoryLink {
  return item.type === 'link'
}

/**
 * 检查是否是子菜单文件夹
 */
export function isSubMenuFolder(item: MenuItem): item is SubMenuFolder {
  return item.type === 'folder'
}

/**
 * 获取所有网站列表（扁平化）
 */
export function getAllSites(menus: MenuItem[]): Site[] {
  const sites: Site[] = []

  menus.forEach((item) => {
    if (isCategoryLink(item)) {
      sites.push(...item.items)
    } else if (isSubMenuFolder(item)) {
      item.children.forEach((child) => {
        sites.push(...child.items)
      })
    }
  })

  return sites
}

/**
 * 根据关键词搜索网站
 */
export function searchSites(sites: Site[], query: string): Site[] {
  if (!query.trim()) return sites

  const lowerQuery = query.toLowerCase()
  return sites.filter(
    (site) =>
      site.name.toLowerCase().includes(lowerQuery) ||
      site.desc.toLowerCase().includes(lowerQuery) ||
      site.url.toLowerCase().includes(lowerQuery)
  )
}

/**
 * 根据分类 ID 获取分类
 */
export function getCategoryById(
  menus: MenuItem[],
  id: string
): CategoryLink | null {
  for (const item of menus) {
    if (isCategoryLink(item) && item.id === id) {
      return item
    } else if (isSubMenuFolder(item)) {
      const child = item.children.find((c) => c.id === id)
      if (child) return child
    }
  }
  return null
}

/**
 * 获取所有分类 ID（用于展开/收起）
 */
export function getAllFolderIds(menus: MenuItem[]): string[] {
  return menus
    .filter((item) => isSubMenuFolder(item))
    .map((item) => (item as SubMenuFolder).id)
}

/**
 * 验证导航数据结构
 */
export function validateNavData(menus: MenuItem[]): boolean {
  try {
    for (const item of menus) {
      if (!item.id || !item.type || !item.title || !item.icon) {
        return false
      }

      if (isCategoryLink(item)) {
        if (!Array.isArray(item.items)) return false
        for (const site of item.items) {
          if (!site.name || !site.url || !site.desc || !site.logo) {
            return false
          }
        }
      } else if (isSubMenuFolder(item)) {
        if (!Array.isArray(item.children)) return false
        for (const child of item.children) {
          if (!child.id || !child.type || !child.title) {
            return false
          }
        }
      }
    }
    return true
  } catch {
    return false
  }
}

