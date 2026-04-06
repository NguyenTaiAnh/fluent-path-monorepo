import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

interface MediaInsertItem {
  media_type: string
  title?: string
  url: string
  source_type?: string
  order_index?: number
  file_size_bytes?: number
  duration_seconds?: number
  mime_type?: string
  metadata?: Record<string, unknown>
}

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/lessons/[id]/media */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { data, error } = await auth.supabase
      .from('lesson_media')
      .select('*')
      .eq('lesson_id', id)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/lessons/[id]/media — Add media to a lesson */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()

    const items: MediaInsertItem[] = Array.isArray(body) ? body : [body]

    const mediaToInsert = items.map((item) => ({
      lesson_id: id,
      media_type: item.media_type,
      title: item.title || null,
      url: item.url,
      source_type: item.source_type || 'google_drive',
      order_index: item.order_index ?? 0,
      file_size_bytes: item.file_size_bytes || null,
      duration_seconds: item.duration_seconds || null,
      mime_type: item.mime_type || null,
      metadata: item.metadata || {},
    }))

    const { data, error } = await auth.supabase.from('lesson_media').insert(mediaToInsert).select()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
