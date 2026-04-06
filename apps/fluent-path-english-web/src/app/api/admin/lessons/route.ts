import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import { requireAdmin, escapeLikePattern } from '@/lib/auth-guard'

/**
 * GET /api/admin/lessons?section_id=&course_id=&type=&search=&sort=&order=
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const supabase = auth.supabase
    const { searchParams } = new URL(request.url)

    const sectionId = searchParams.get('section_id')
    const courseId = searchParams.get('course_id')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order_index'
    const order = searchParams.get('order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100)

    let query = supabase
      .from('lessons')
      .select(
        '*, sections!inner(id, title, course_id, courses!inner(id, title)), lesson_media(count)',
        { count: 'exact' },
      )

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }
    if (courseId) {
      query = query.eq('sections.course_id', courseId)
    }
    if (type && type !== 'all') {
      query = query.eq('lesson_type', type)
    }
    if (search) {
      query = query.ilike('title', `%${escapeLikePattern(search)}%`)
    }

    query = query.order(sort, { ascending: order === 'asc' })

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    })
  } catch (error) {
    console.error('Lessons API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/lessons
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const {
      section_id,
      title,
      description,
      lesson_type,
      order_index,
      duration_seconds,
      is_free,
      is_published,
      metadata,
    } = body

    if (!section_id || !title || !lesson_type) {
      return NextResponse.json(
        { success: false, error: 'section_id, title, and lesson_type are required' },
        { status: 400 },
      )
    }

    const slug = slugify(title)

    const { data, error } = await auth.supabase
      .from('lessons')
      .insert({
        section_id,
        title,
        slug,
        description: description || null,
        lesson_type,
        order_index: order_index ?? 0,
        duration_seconds: duration_seconds ?? 0,
        is_free: is_free ?? false,
        is_published: is_published ?? true,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Lesson create error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
