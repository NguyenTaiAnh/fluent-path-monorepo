import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'
import { slugify } from '@/lib/utils'

/**
 * GET /api/admin/courses
 * List all courses with filters: ?status=&level=&search=&sort=&order=&page=&pageSize=
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const level = searchParams.get('level')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order_index'
    const order = searchParams.get('order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    let query = supabase.from('courses').select('*, sections(lessons(id))', { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (level && level !== 'all') {
      query = query.eq('level', level)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const ascending = order === 'asc'
    query = query.order(sort, { ascending })

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Compute live lesson count from nested data and strip raw sections
    type RawCourse = {
      sections?: Array<{ lessons?: Array<{ id: string }> }>
      [key: string]: unknown
    }
    const mapped = (data as RawCourse[] | null)?.map((c) => ({
      ...c,
      total_lessons: c.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ?? 0,
      sections: undefined,
    }))

    return NextResponse.json({
      success: true,
      data: mapped ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    })
  } catch (error) {
    console.error('Courses API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const {
      title,
      description,
      level,
      status,
      order_index,
      price,
      original_price,
      thumbnail_url,
      metadata,
    } = body

    if (!title || !level) {
      return NextResponse.json(
        { success: false, error: 'Title and level are required' },
        { status: 400 },
      )
    }

    let slug = slugify(title)
    const { data: existing } = await supabase
      .from('courses')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        title,
        slug,
        description: description || null,
        level,
        status: status || 'draft',
        order_index: order_index ?? 0,
        price: price ?? 0,
        original_price: original_price ?? 0,
        thumbnail_url: thumbnail_url || null,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Course create error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
