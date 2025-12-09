import { NextResponse, NextRequest } from 'next/server'
import { storage, diagnoseEnv } from '@/lib/storage-edge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function normalizeNavData(payload: any) {
  const out = { menus: Array.isArray(payload?.menus) ? payload.menus : [] } as any
  out.menus = out.menus.map((m: any) => {
    const base = {
      id: String(m?.id ?? ''),
      type: m?.type === 'folder' ? 'folder' : 'link',
      title: String(m?.title ?? ''),
      icon: typeof m?.icon === 'string' ? m.icon : 'linecons-tag',
    }
    if (base.type === 'link') {
      const items = Array.isArray(m?.items) ? m.items : []
      base['items'] = items.map((s: any) => ({
        name: String(s?.name ?? ''),
        url: String(s?.url ?? ''),
        desc: typeof s?.desc === 'string' ? s.desc : '',
        logo: typeof s?.logo === 'string' ? s.logo : '',
      }))
      return base
    } else {
      const children = Array.isArray(m?.children) ? m.children : []
      base['children'] = children.map((c: any) => ({
        id: String(c?.id ?? ''),
        type: 'link',
        title: String(c?.title ?? ''),
        icon: typeof c?.icon === 'string' ? c.icon : 'linecons-tag',
        items: Array.isArray(c?.items)
          ? c.items.map((s: any) => ({
              name: String(s?.name ?? ''),
              url: String(s?.url ?? ''),
              desc: typeof s?.desc === 'string' ? s.desc : '',
              logo: typeof s?.logo === 'string' ? s.logo : '',
            }))
          : [],
      }))
      return base
    }
  })
  return out
}

export async function GET() {
  try {
    const data = await storage.getNavData()
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    console.error('[API /nav GET]', error?.message || error)
    return NextResponse.json({ 
      error: 'Failed to fetch navigation data',
      message: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (token !== 'dev-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[API /nav POST] Request received')
    
    // 诊断环境变量
    const diagnosis = diagnoseEnv()
    console.log('[API /nav POST] Environment diagnosis:', JSON.stringify(diagnosis, null, 2))
    
    if (!diagnosis.kvAvailable) {
      console.error('[API /nav POST] ⚠️ WEBSTACK_KV is not available!')
      console.error('[API /nav POST] Diagnosis details:', diagnosis.details)
    }
    
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      console.error('[API /nav POST] Invalid payload')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    console.log('[API /nav POST] Payload received, menus count:', body?.menus?.length || 0)

    const normalized = normalizeNavData(body)
    // 宽松处理：如果有缺失 id/title，自动生成占位，避免 400
    normalized.menus = (normalized.menus || []).map((m: any, idx: number) => {
      if (!m.id) m.id = `cat_${Date.now()}_${idx}`
      if (!m.title) m.title = `分类 ${idx + 1}`
      if (m.type === 'folder') {
        m.children = (m.children || []).map((c: any, j: number) => {
          if (!c.id) c.id = `sub_${Date.now()}_${idx}_${j}`
          if (!c.title) c.title = `子分类 ${j + 1}`
          return c
        })
      }
      return m
    })

    console.log('[API /nav POST] Normalized data, menus count:', normalized.menus?.length || 0)
    console.log('[API /nav POST] Attempting to save...')

    await storage.saveNavData(normalized)
    
    console.log('[API /nav POST] ✓ Save completed successfully')
    return NextResponse.json({ message: 'Navigation data updated successfully' }, { status: 200 })
  } catch (error: any) {
    console.error('[API /nav POST] ✗ Error occurred:', error?.message || error)
    console.error('[API /nav POST] Error stack:', error?.stack)
    return NextResponse.json({ 
      error: String(error?.message || 'Failed to update navigation data'),
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}
