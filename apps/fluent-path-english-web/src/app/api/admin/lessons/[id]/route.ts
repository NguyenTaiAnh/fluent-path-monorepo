import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-guard'

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/lessons/[id] - with media and vocabularies */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { data, error } = await auth.supabase
      .from('lessons')
      .select(
        '*, sections(id, title, course_id, courses(id, title)), lesson_media(*), vocabularies(*)',
      )
      .eq('id', id)
      .single()

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500
      return NextResponse.json({ success: false, error: error.message }, { status })
    }

    if (data?.lesson_media) {
      ;(data.lesson_media as { order_index: number }[]).sort(
        (a, b) => a.order_index - b.order_index,
      )
    }
    if (data?.vocabularies) {
      ;(data.vocabularies as { order_index: number }[]).sort(
        (a, b) => a.order_index - b.order_index,
      )
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/lessons/[id] */
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.title !== undefined) {
      updateData.title = body.title
      updateData.slug = slugify(body.title)
    }
    if (body.description !== undefined) updateData.description = body.description
    if (body.lesson_type !== undefined) updateData.lesson_type = body.lesson_type
    if (body.section_id !== undefined) updateData.section_id = body.section_id
    if (body.order_index !== undefined) updateData.order_index = body.order_index
    if (body.duration_seconds !== undefined) updateData.duration_seconds = body.duration_seconds
    if (body.is_free !== undefined) updateData.is_free = body.is_free
    if (body.is_published !== undefined) updateData.is_published = body.is_published
    if (body.metadata !== undefined) updateData.metadata = body.metadata

    const { data, error } = await auth.supabase
      .from('lessons')
      .update(updateData)
      .eq('id', id)
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

/** DELETE /api/admin/lessons/[id] */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { error } = await auth.supabase.from('lessons').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted' })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
