'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: {
        sitekey: string
        callback?: (token: string) => void
        'error-callback'?: () => void
        'expired-callback'?: () => void
      }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface TurnstileProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export default function Turnstile({ siteKey, onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const callbacksRef = useRef({ onVerify, onError, onExpire })
  const scriptLoadedRef = useRef(false)

  // 更新回调引用，避免重新渲染
  useEffect(() => {
    callbacksRef.current = { onVerify, onError, onExpire }
  }, [onVerify, onError, onExpire])

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return
    if (!siteKey) return

    // 如果脚本已加载，直接渲染
    if (window.turnstile && containerRef.current && !widgetIdRef.current) {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => callbacksRef.current.onVerify(token),
        'error-callback': () => callbacksRef.current.onError?.(),
        'expired-callback': () => callbacksRef.current.onExpire?.(),
      })
      return
    }

    // 如果脚本未加载，加载脚本
    if (!scriptLoadedRef.current) {
      // 检查是否已经存在脚本
      const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]')
      if (existingScript) {
        scriptLoadedRef.current = true
        // 等待 turnstile 可用
        const checkTurnstile = setInterval(() => {
          if (window.turnstile && containerRef.current && !widgetIdRef.current) {
            clearInterval(checkTurnstile)
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              callback: (token: string) => callbacksRef.current.onVerify(token),
              'error-callback': () => callbacksRef.current.onError?.(),
              'expired-callback': () => callbacksRef.current.onExpire?.(),
            })
          }
        }, 100)
        return () => clearInterval(checkTurnstile)
      }

      scriptLoadedRef.current = true
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true

      script.onload = () => {
        if (containerRef.current && window.turnstile && !widgetIdRef.current) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => callbacksRef.current.onVerify(token),
            'error-callback': () => callbacksRef.current.onError?.(),
            'expired-callback': () => callbacksRef.current.onExpire?.(),
          })
        }
      }

      document.body.appendChild(script)
    }

    return () => {
      // 清理 widget
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // 忽略清理错误
        }
        widgetIdRef.current = null
      }
    }
  }, [siteKey]) // 只依赖 siteKey

  return <div ref={containerRef} />
}

