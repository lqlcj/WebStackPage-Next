"use client"

import { useEffect, useRef, useState } from 'react'
import { isHostedLogo } from '@/lib/hosted'

// Types (与 src/types/nav.ts 对齐的最小定义)
interface Site { name: string; url: string; desc: string; logo: string }
interface CategoryLink { id: string; type: 'link'; title: string; icon: string; items: Site[] }
interface SubMenuFolder { id: string; type: 'folder'; title: string; icon: string; children: CategoryLink[] }
export type MenuItem = CategoryLink | SubMenuFolder
export interface NavData { menus: MenuItem[] }

interface VisualEditorProps {
  value: NavData
  onChange: (val: NavData) => void
}

export default function VisualEditor({ value, onChange }: VisualEditorProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pendingMenuIndex, setPendingMenuIndex] = useState<number | null>(null)
  const menuRefs = useRef<(HTMLDivElement | null)[]>([])

  // 显示提示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const update = (nv: NavData) => onChange(structuredClone(nv))

  // Helpers
  const addMenu = (type: 'link' | 'folder') => {
    const nv: NavData = structuredClone(value)
    if (type === 'link') {
      nv.menus.push({ id: genId('新分类'), type: 'link', title: '新分类', icon: 'linecons-star', items: [] })
    } else {
      nv.menus.push({ id: genId('新目录'), type: 'folder', title: '新目录', icon: 'linecons-lightbulb', children: [] })
    }
    // 记录新建项索引，用于滚动定位与聚焦
    setPendingMenuIndex(nv.menus.length - 1)
    update(nv)
  }

  const removeMenu = async (mi: number) => {
    const nv: NavData = structuredClone(value)
    // 级联删除托管 Logo
    const sites = collectSitesFromMenu(nv.menus[mi])
    await deleteHostedSitesLogos(sites)
    nv.menus.splice(mi, 1)
    update(nv)
  }

  const addChild = (mi: number) => {
    const nv: NavData = structuredClone(value)
    const m = nv.menus[mi]
    if (m.type === 'folder') {
      m.children.push({ id: genId('子分类'), type: 'link', title: '子分类', icon: 'linecons-tag', items: [] })
      update(nv)
    }
  }

  const removeChild = async (mi: number, ci: number) => {
    const nv: NavData = structuredClone(value)
    const m = nv.menus[mi]
    if (m.type === 'folder') {
      const sites = m.children[ci].items
      await deleteHostedSitesLogos(sites)
      m.children.splice(ci, 1)
      update(nv)
    }
  }

  const addSite = (mi: number, ci?: number) => {
    const nv: NavData = structuredClone(value)
    const site: Site = { name: '新网站', url: 'https://', desc: '', logo: '' }
    const m = nv.menus[mi]
    if (m.type === 'link') m.items.push(site)
    else if (m.type === 'folder' && typeof ci === 'number') m.children[ci].items.push(site)
    update(nv)
  }

  const removeSite = async (mi: number, ciOrSi: number, siMaybe?: number) => {
    const nv: NavData = structuredClone(value)
    const m = nv.menus[mi]
    if (m.type === 'link') {
      const si = ciOrSi
      const s = m.items[si]
      await deleteHostedLogo(s.logo)
      m.items.splice(si, 1)
    } else {
      const ci = ciOrSi
      const si = siMaybe as number
      const s = m.children[ci].items[si]
      await deleteHostedLogo(s.logo)
      m.children[ci].items.splice(si, 1)
    }
    update(nv)
  }

  const onFieldChange = (path: (string|number)[], val: any) => {
    const nv: NavData = structuredClone(value)
    setByPath(nv, path, val)
    update(nv)
  }

  const onUploadLogo = async (mi: number, ciOrSi: number, siMaybe?: number, file: File | null) => {
    if (!file) return
    setBusy('上传中...')
    try {
      const prev = getSiteAt(value, mi, ciOrSi, siMaybe)
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('上传失败')
      const j = await res.json()
      // 删除旧图（若托管）
      if (isHostedLogo(prev.logo)) {
        await fetch(`/api/upload?url=${encodeURIComponent(prev.logo)}`, { method: 'DELETE' })
      }
      // 写入新 URL
      const nv: NavData = structuredClone(value)
      const site = getSiteAt(nv, mi, ciOrSi, siMaybe)
      site.logo = j.url
      update(nv)
      showMessage('success', '上传成功')
    } catch (e) {
      console.error(e)
      showMessage('error', '上传失败')
    } finally {
      setBusy(null)
    }
  }

  // 新建后自动滚动到对应面板并聚焦第一个输入框
  useEffect(() => {
    if (pendingMenuIndex == null) return
    const el = menuRefs.current[pendingMenuIndex]
    if (el) {
      // 使用 block: 'center' 确保新项在视口中央，并添加偏移量避免被顶部固定元素遮挡
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // 延迟一点点等待滚动与渲染稳定
      setTimeout(() => {
        const firstInput = el.querySelector('input') as HTMLInputElement | null
        if (firstInput) {
          try { firstInput.focus(); firstInput.select(); } catch {}
        }
      }, 300)
    }
    setPendingMenuIndex(null)
  }, [pendingMenuIndex, value.menus.length])

  return (
    <div>
      {busy && <div style={{ color: '#888', marginBottom: 8 }}>{busy}</div>}
      {message && (
        <div style={{
          background: message.type === 'success' ? '#dfd' : '#fee',
          border: `1px solid ${message.type === 'success' ? '#bfb' : '#fbb'}`,
          color: message.type === 'success' ? '#060' : '#a00',
          padding: 10,
          marginBottom: 12,
          borderRadius: 4
        }}>
          {message.text}
        </div>
      )}

      {/* 顶部工具条 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-primary" onClick={() => addMenu('link')}>新增一级分类（含网址）</button>
        <button className="btn btn-default" onClick={() => addMenu('folder')}>新增折叠目录（含子分类）</button>
      </div>

      {/* 菜单列表 */}
      {value.menus.map((m, mi) => (
        <div
          key={mi}
          ref={(el) => (menuRefs.current[mi] = el)}
          className="panel panel-default"
          style={{ padding: 12, marginBottom: 12 }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <strong>菜单 {mi + 1}</strong>
            <span className="label label-info">{m.type}</span>
            <button className="btn btn-xs btn-danger" onClick={() => removeMenu(mi)}>删除菜单</button>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <div className="col-sm-3">
              <label>ID</label>
              <input className="form-control" value={m.id}
                onChange={(e) => onFieldChange(['menus', mi, 'id'], e.target.value)} />
            </div>
            <div className="col-sm-3">
              <label>标题</label>
              <input className="form-control" value={m.title}
                onChange={(e) => onFieldChange(['menus', mi, 'title'], e.target.value)} />
            </div>
            <div className="col-sm-3">
              <label>图标类</label>
              <input className="form-control" value={m.icon}
                onChange={(e) => onFieldChange(['menus', mi, 'icon'], e.target.value)} />
            </div>
          </div>

          {m.type === 'link' ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5>站点列表</h5>
                <button className="btn btn-xs btn-success" onClick={() => addSite(mi)}>新增站点</button>
              </div>
              {m.items.map((s, si) => (
                <div key={si} className="well" style={{ padding: 10 }}>
                  <div className="row">
                    <div className="col-sm-3">
                      <label>名称</label>
                      <input className="form-control" value={s.name}
                        onChange={(e) => onFieldChange(['menus', mi, 'items', si, 'name'], e.target.value)} />
                    </div>
                    <div className="col-sm-3">
                      <label>URL</label>
                      <input className="form-control" value={s.url}
                        onChange={(e) => onFieldChange(['menus', mi, 'items', si, 'url'], e.target.value)} />
                    </div>
                    <div className="col-sm-4">
                      <label>描述</label>
                      <input className="form-control" value={s.desc}
                        onChange={(e) => onFieldChange(['menus', mi, 'items', si, 'desc'], e.target.value)} />
                    </div>
                    <div className="col-sm-2">
                      <label>Logo</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input className="form-control" value={s.logo}
                          onChange={(e) => onFieldChange(['menus', mi, 'items', si, 'logo'], e.target.value)} />
                        <label className="btn btn-default btn-xs" style={{ marginBottom: 0 }}>
                          上传
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={(e) => onUploadLogo(mi, si, undefined, e.target.files?.[0] || null)} />
                        </label>
                        <button className="btn btn-danger btn-xs" title="删除当前 Logo（仅托管资源）"
                          onClick={async () => { 
                            try {
                              await deleteHostedLogo(s.logo)
                              onFieldChange(['menus', mi, 'items', si, 'logo'], '')
                              showMessage('success', '移除成功')
                            } catch (e) {
                              showMessage('error', '移除失败')
                            }
                          }}>
                          移除
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button className="btn btn-xs btn-danger" onClick={() => removeSite(mi, si)}>删除站点</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5>子分类</h5>
                <button className="btn btn-xs btn-success" onClick={() => addChild(mi)}>新增子分类</button>
              </div>
              {m.children.map((c, ci) => (
                <div key={ci} className="panel" style={{ padding: 10, border: '1px solid #eee' }}>
                  <div className="row">
                    <div className="col-sm-3">
                      <label>ID</label>
                      <input className="form-control" value={c.id}
                        onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'id'], e.target.value)} />
                    </div>
                    <div className="col-sm-3">
                      <label>标题</label>
                      <input className="form-control" value={c.title}
                        onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'title'], e.target.value)} />
                    </div>
                    <div className="col-sm-3">
                      <label>图标类</label>
                      <input className="form-control" value={c.icon}
                        onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'icon'], e.target.value)} />
                    </div>
                    <div className="col-sm-3" style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button className="btn btn-xs btn-danger" onClick={() => removeChild(mi, ci)}>删除子分类</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>站点列表</strong>
                      <button className="btn btn-xs btn-success" onClick={() => addSite(mi, ci)}>新增站点</button>
                    </div>
                    {c.items.map((s, si) => (
                      <div key={si} className="well" style={{ padding: 10 }}>
                        <div className="row">
                          <div className="col-sm-3">
                            <label>名称</label>
                            <input className="form-control" value={s.name}
                              onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'items', si, 'name'], e.target.value)} />
                          </div>
                          <div className="col-sm-3">
                            <label>URL</label>
                            <input className="form-control" value={s.url}
                              onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'items', si, 'url'], e.target.value)} />
                          </div>
                          <div className="col-sm-4">
                            <label>描述</label>
                            <input className="form-control" value={s.desc}
                              onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'items', si, 'desc'], e.target.value)} />
                          </div>
                          <div className="col-sm-2">
                            <label>Logo</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <input className="form-control" value={s.logo}
                                onChange={(e) => onFieldChange(['menus', mi, 'children', ci, 'items', si, 'logo'], e.target.value)} />
                              <label className="btn btn-default btn-xs" style={{ marginBottom: 0 }}>
                                上传
                                <input type="file" accept="image/*" style={{ display: 'none' }}
                                  onChange={(e) => onUploadLogo(mi, ci, si, e.target.files?.[0] || null)} />
                              </label>
                            </div>
                          </div>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <button className="btn btn-xs btn-danger" onClick={() => removeSite(mi, ci, si)}>删除站点</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function genId(title: string) {
  const base = title.trim().replace(/\s+/g, '')
  return base || `id_${Date.now()}`
}

function setByPath(obj: any, path: (string|number)[], val: any) {
  let cur = obj
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]]
  }
  cur[path[path.length - 1]] = val
}

function getSiteAt(data: NavData, mi: number, ciOrSi: number, siMaybe?: number): Site {
  const m = data.menus[mi] as any
  if (m.type === 'link') return m.items[ciOrSi]
  return m.children[ciOrSi].items[siMaybe as number]
}

function collectSitesFromMenu(m: MenuItem): Site[] {
  if (m.type === 'link') return [...m.items]
  const res: Site[] = []
  m.children.forEach((c) => res.push(...c.items))
  return res
}

async function deleteHostedSitesLogos(sites: Site[]) {
  for (const s of sites) {
    if (isHostedLogo(s.logo)) {
      try { await fetch(`/api/upload?url=${encodeURIComponent(s.logo)}`, { method: 'DELETE' }) } catch {}
    }
  }
}

async function deleteHostedLogo(url?: string) {
  if (!url) return
  if (isHostedLogo(url)) {
    try { await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: 'DELETE' }) } catch {}
  }
}

