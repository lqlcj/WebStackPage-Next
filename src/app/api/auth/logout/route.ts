import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST() {
  const res = NextResponse.json({ message: 'Logout success' })
  res.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' })
  return res
}

