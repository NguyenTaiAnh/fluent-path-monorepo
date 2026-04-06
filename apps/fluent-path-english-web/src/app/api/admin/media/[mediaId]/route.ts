import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

type Params = { params: Promise<{ mediaId: string }> }

/** PUT /api/admin/media/[mediaId] */
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { mediaId } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.media_type !== undefined) updateData.media_type = body.media_type
    if (body.title !== undefined) updateData.title = body.title
    if (body.url !== undefined) updateData.url = body.url
    if (body.source_type !== undefined) updateData.source_type = body.source_type
    if (body.order_index !== undefined) updateData.order_index = body.order_index
    if (body.file_size_bytes !== undefined) updateData.file_size_bytes = body.file_size_bytes
    if (body.duration_seconds !== undefined) updateData.duration_seconds = body.duration_seconds
    if (body.mime_type !== undefined) updateData.mime_type = body.mime_type
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    const { data, error } = await auth.supabase
      .from('lesson_media')
      .update(updateData)
      .eq('id', mediaId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/media/[mediaId] */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { mediaId } = await params
    const { error } = await auth.supabase.from('lesson_media').delete().eq('id', mediaId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Media deleted' })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
