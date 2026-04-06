import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-guard'

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/sections/[id] */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { data, error } = await auth.supabase
      .from('sections')
      .select('*, courses(id, title), lessons(*, lesson_media(*), vocabularies(*))')
      .eq('id', id)
      .single()

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500
      return NextResponse.json({ success: false, error: error.message }, { status })
    }

    if (data?.lessons) {
      ;(data.lessons as { order_index: number }[]).sort((a, b) => a.order_index - b.order_index)
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/sections/[id] */
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
    if (body.order_index !== undefined) updateData.order_index = body.order_index
    if (body.course_id !== undefined) updateData.course_id = body.course_id

    const { data, error } = await auth.supabase
      .from('sections')
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

/** DELETE /api/admin/sections/[id] */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { error } = await auth.supabase.from('sections').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Section deleted' })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
