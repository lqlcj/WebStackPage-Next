import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 中间件：恢复未登录访问 /admin 的重定向到 /admin/login
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 允许无需鉴权的 /admin/login
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // 未登录禁止访问 /admin 及其子路由（/admin 开头），重定向到 /admin/login
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value
    if (token !== 'dev-token') {
      const url = new URL('/admin/login', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
