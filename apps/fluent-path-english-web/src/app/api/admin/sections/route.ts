import { NextRequest, NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'
import { requireAdmin, escapeLikePattern } from '@/lib/auth-guard'

/** GET /api/admin/sections */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const supabase = auth.supabase
    const { searchParams } = new URL(request.url)

    const courseId = searchParams.get('course_id')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order_index'
    const order = searchParams.get('order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 100)

    let query = supabase
      .from('sections')
      .select('*, courses!inner(id, title), lessons(count)', { count: 'exact' })

    if (courseId) query = query.eq('course_id', courseId)
    if (search) query = query.ilike('title', `%${escapeLikePattern(search)}%`)

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
    console.error('Sections API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** POST /api/admin/sections */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { course_id, title, description, order_index } = body

    if (!course_id || !title) {
      return NextResponse.json(
        { success: false, error: 'course_id and title are required' },
        { status: 400 },
      )
    }

    const { data, error } = await auth.supabase
      .from('sections')
      .insert({
        course_id,
        title,
        slug: slugify(title),
        description: description || null,
        order_index: order_index ?? 0,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('Section create error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
