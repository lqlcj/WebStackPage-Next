'use client'

import { useEffect, useState } from 'react'
import type { NavData } from '@/types/nav'
import VisualEditor from '@/components/admin/VisualEditor'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // 视图模式：visual（可视化）/ json（原始 JSON）
  const [view, setView] = useState<'visual' | 'json'>('visual')

  // 数据状态
  const [navObj, setNavObj] = useState<NavData | null>(null)
  const [jsonText, setJsonText] = useState('')

  // 登录检测 + 拉取数据
  useEffect(() => {
    const init = async () => {
      try {
        const s = await fetch('/api/auth/status', { cache: 'no-store' })
        const sj = await s.json()
        setLoggedIn(!!sj.loggedIn)
        if (sj.loggedIn) {
          setLoading(true)
          const res = await fetch('/api/nav', { cache: 'no-store' })
          if (!res.ok) throw new Error('加载导航数据失败')
          const data = (await res.json()) as NavData
          setNavObj(data)
          setJsonText(JSON.stringify(data, null, 2))
        }
      } catch (e: any) {
        setError(e.message || '未知错误')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || '登录失败')
      }
      setLoggedIn(true)
      // 登录后取数据
      setLoading(true)
      const navRes = await fetch('/api/nav', { cache: 'no-store' })
      if (!navRes.ok) throw new Error('加载导航数据失败')
      const data = (await navRes.json()) as NavData
      setNavObj(data)
      setJsonText(JSON.stringify(data, null, 2))
    } catch (e: any) {
      setError(e.message || '未知错误')
    } finally {
      setAuthLoading(false)
      setLoading(false)
    }
  }

  // 可视化编辑回调：实时同步 JSON 文本（便于切换视图）
  const onVisualChange = (v: NavData) => {
    setNavObj(v)
    try {
      setJsonText(JSON.stringify(v, null, 2))
    } catch {}
  }

  // 保存
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      let payload: NavData
      if (view === 'visual') {
        if (!navObj) throw new Error('数据未加载')
        payload = navObj
      } else {
        try {
          const parsed = JSON.parse(jsonText)
          payload = parsed
          setNavObj(parsed)
        } catch (e) {
          throw new Error('JSON 解析失败，请检查格式是否正确')
        }
      }

      const res = await fetch('/api/nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || '保存失败（可能未登录或数据校验失败）')
      }
      alert('保存成功！')
    } catch (e: any) {
      setError(e.message || '未知错误')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="main-content" style={{ padding: 20, maxWidth: 1120, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 10 }}>管理后台</h3>
      {error && (
        <div style={{ background: '#fee', border: '1px solid #fbb', padding: 10, marginBottom: 10, color: '#a00' }}>
          {error}
        </div>
      )}

      {!loggedIn ? (
        <form onSubmit={handleLogin} style={{ maxWidth: 420 }}>
          <div className="form-group">
            <label>管理密码</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码（默认 admin123，可用 ADMIN_PASSWORD 覆盖）"
              required
            />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={authLoading}>
              {authLoading ? '登录中...' : '登录'}
            </button>
            <a className="btn btn-default" href="/">返回首页</a>
          </div>
        </form>
      ) : loading ? (
        <div>加载中...</div>
      ) : (
        <>
          {/* 视图切换与操作 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div className="btn-group">
              <button className={`btn btn-default ${view === 'visual' ? 'active' : ''}`} onClick={() => setView('visual')}>可视化</button>
              <button className={`btn btn-default ${view === 'json' ? 'active' : ''}`} onClick={() => setView('json')}>JSON</button>
            </div>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            <a className="btn btn-default" href="/">返回首页</a>
          </div>

          {/* 主编辑区 */}
          {view === 'visual' ? (
            navObj ? (
              <VisualEditor value={navObj} onChange={onVisualChange} />
            ) : (
              <div>数据为空</div>
            )
          ) : (
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{ width: '100%', height: '70vh', fontFamily: 'Consolas, Menlo, monospace', fontSize: 13, lineHeight: '1.5', padding: 12, border: '1px solid #ddd', borderRadius: 4 }}
            />
          )}
        </>
      )}
    </div>
  )
}
