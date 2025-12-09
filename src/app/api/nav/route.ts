import { NextResponse, NextRequest } from 'next/server'
import { storage } from '@/lib/storage-edge'
import { validateNavData } from '@/utils/nav'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await storage.getNavData()
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch navigation data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 简易鉴权
    const token = request.cookies.get('token')?.value
    if (token !== 'dev-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !Array.isArray(body.menus)) {
      return NextResponse.json({ error: 'Invalid payload: { menus: MenuItem[] } required' }, { status: 400 })
    }

    if (!validateNavData(body.menus)) {
      return NextResponse.json({ error: 'Validation failed: menus structure is invalid' }, { status: 400 })
    }

    await storage.saveNavData({ menus: body.menus })
    return NextResponse.json({ message: 'Navigation data updated successfully' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update navigation data' }, { status: 500 })
  }
}
