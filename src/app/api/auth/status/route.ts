import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const loggedIn = token === 'dev-token'
  return NextResponse.json({ loggedIn })
}
