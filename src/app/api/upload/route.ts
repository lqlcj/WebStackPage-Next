import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/lib/storage-edge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// POST /api/upload - multipart/form-data { file }
export async function POST(req: NextRequest) {
  try {
    // 简易鉴权
    const token = req.cookies.get('token')?.value
    if (token !== 'dev-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const buf = await file.arrayBuffer()
    const url = await storage.uploadImage(buf, file.name)
    return NextResponse.json({ url })
  } catch (e) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// DELETE /api/upload?url=...
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (token !== 'dev-token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = req.nextUrl.searchParams.get('url') || ''
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }
    await storage.deleteImage(url)
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}

