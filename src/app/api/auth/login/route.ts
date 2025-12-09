import { NextResponse } from 'next/server'

export const runtime = 'edge'

const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const expected = process.env.ADMIN_PASSWORD || 'admin123'

    if (password !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 简化：使用固定 token。生产可改为随机并与存储校验
    const token = 'dev-token'

    const res = NextResponse.json({ message: 'Login success' })
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE,
    })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}

