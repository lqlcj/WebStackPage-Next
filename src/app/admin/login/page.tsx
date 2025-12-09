'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
      router.push('/admin')
    } catch (e: any) {
      setError(e.message || '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content" style={{ padding: 20, maxWidth: 460, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 16 }}>管理员登录</h3>
      {error && (
        <div style={{ background: '#fee', border: '1px solid #fbb', padding: 10, marginBottom: 10, color: '#a00' }}>
          {error}
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>管理密码</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码（默认 admin123，可用环境变量 ADMIN_PASSWORD 覆盖）"
            required
          />
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
          <a className="btn btn-default" href="/">返回首页</a>
        </div>
      </form>
    </div>
  )
}

