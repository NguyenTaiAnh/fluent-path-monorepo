import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/auth-guard'

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/courses/[id] */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const supabase = auth.supabase

    const { data, error } = await supabase
      .from('courses')
      .select(`*, sections (*, lessons (*, lesson_media (*), vocabularies (*)))`)
      .eq('id', id)
      .order('order_index', { referencedTable: 'sections', ascending: true })
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (data?.sections) {
      data.sections = data.sections.map((section: Record<string, unknown>) => ({
        ...section,
        lessons: ((section.lessons as { order_index: number }[]) ?? []).sort(
          (a, b) => a.order_index - b.order_index,
        ),
      }))
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Course detail error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/courses/[id] */
export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const supabase = auth.supabase
    const body = await request.json()

    const { title, description, level, status, order_index, price, original_price, thumbnail_url, metadata } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) { updateData.title = title; updateData.slug = slugify(title) }
    if (description !== undefined) updateData.description = description
    if (level !== undefined) updateData.level = level
    if (status !== undefined) updateData.status = status
    if (order_index !== undefined) updateData.order_index = order_index
    if (price !== undefined) updateData.price = price
    if (original_price !== undefined) updateData.original_price = original_price
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (metadata !== undefined) updateData.metadata = metadata

    const { data, error } = await supabase.from('courses').update(updateData).eq('id', id).select().single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Course update error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/admin/courses/[id] */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const { error } = await auth.supabase.from('courses').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Course deleted' })
  } catch (error) {
    console.error('Course delete error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
