import { useState, useCallback } from 'react'

/**
 * 自定义 Hook: useNavigation
 * 管理导航相关的状态和逻辑
 */
export function useNavigation() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const toggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const expandAllFolders = useCallback((ids: string[]) => {
    setExpandedFolders(new Set(ids))
  }, [])

  const collapseAllFolders = useCallback(() => {
    setExpandedFolders(new Set())
  }, [])

  const isFolderExpanded = useCallback(
    (id: string) => expandedFolders.has(id),
    [expandedFolders]
  )

  return {
    expandedFolders,
    searchQuery,
    setSearchQuery,
    toggleFolder,
    expandAllFolders,
    collapseAllFolders,
    isFolderExpanded,
  }
}

