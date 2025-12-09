'use client'

import { useEffect, useState, useRef } from 'react'
import type { NavData } from '@/types/nav'
import VisualEditor from '@/components/admin/VisualEditor'
import Turnstile from '@/components/Turnstile'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // 数据状态
  const [navObj, setNavObj] = useState<NavData | null>(null)

  // 返回顶部功能
  const [showBackToTop, setShowBackToTop] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // 监听滚动，显示/隐藏返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 返回顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        }
      } catch (e: any) {
        setError(e.message || '未知错误')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (turnstileSiteKey && !turnstileToken) {
      setError('请完成人机验证')
      return
    }
    setAuthLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, turnstileToken: turnstileToken || undefined }),
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
    } catch (e: any) {
      setError(e.message || '未知错误')
      setTurnstileToken(null) // 失败后重置 token
    } finally {
      setAuthLoading(false)
      setLoading(false)
    }
  }

  // 可视化编辑回调
  const onVisualChange = (v: NavData) => {
    setNavObj(v)
  }

  // 保存
  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (!navObj) throw new Error('数据未加载')

      const res = await fetch('/api/nav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navObj),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || '保存失败（可能未登录或数据校验失败）')
      }
      setSuccess('保存成功！')
      // 3秒后自动清除成功提示
      setTimeout(() => setSuccess(null), 3000)
    } catch (e: any) {
      setError(e.message || '未知错误')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="main-content" style={{ padding: 20, maxWidth: 1120, margin: '0 auto', position: 'relative' }} ref={contentRef}>
      <h3 style={{ marginBottom: 10 }}>管理后台</h3>
      {error && (
        <div style={{ background: '#fee', border: '1px solid #fbb', padding: 10, marginBottom: 10, color: '#a00', borderRadius: 4 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#dfd', border: '1px solid #bfb', padding: 10, marginBottom: 10, color: '#060', borderRadius: 4 }}>
          {success}
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
          {turnstileSiteKey && (
            <div className="form-group" style={{ marginTop: 12 }}>
              <Turnstile
                siteKey={turnstileSiteKey}
                onVerify={(token) => setTurnstileToken(token)}
                onError={() => {
                  setTurnstileToken(null)
                  setError('人机验证失败，请重试')
                }}
                onExpire={() => {
                  setTurnstileToken(null)
                  setError('验证已过期，请重新验证')
                }}
              />
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={authLoading || (!!turnstileSiteKey && !turnstileToken)}>
              {authLoading ? '登录中...' : '登录'}
            </button>
            <a className="btn btn-default" href="/">返回首页</a>
          </div>
        </form>
      ) : loading ? (
        <div>加载中...</div>
      ) : (
        <>
          {/* 操作栏 */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <button className="btn btn-success" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            <a className="btn btn-default" href="/">返回首页</a>
          </div>

          {/* 主编辑区 */}
          {navObj ? (
            <VisualEditor value={navObj} onChange={onVisualChange} />
          ) : (
            <div>数据为空</div>
          )}

          {/* 底部保存按钮 */}
          <div style={{ 
            position: 'sticky', 
            bottom: 0, 
            background: '#fff', 
            padding: '16px 0', 
            borderTop: '1px solid #ddd',
            marginTop: 20,
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            zIndex: 10
          }}>
            <button className="btn btn-success btn-lg" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
            <a className="btn btn-default btn-lg" href="/">返回首页</a>
          </div>
        </>
      )}

      {/* 返回顶部按钮（电梯导航） */}
      {loggedIn && !loading && showBackToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#5cb85c',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#4cae4c'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#5cb85c'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title="返回顶部"
        >
          ↑
        </button>
      )}
    </div>
  )
}
