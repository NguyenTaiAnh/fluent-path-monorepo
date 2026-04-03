import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

/**
 * GET /api/admin/enrollments?user_id=&course_id=&status=&sort=&order=
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get('user_id')
    const courseId = searchParams.get('course_id')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || 'enrolled_at'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    let query = supabase
      .from('enrollments')
      .select(
        '*, profiles!user_id(id, full_name, email, avatar_url), courses!course_id(id, title, level)',
        { count: 'exact' },
      )

    if (userId) query = query.eq('user_id', userId)
    if (courseId) query = query.eq('course_id', courseId)
    if (status && status !== 'all') query = query.eq('status', status)

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
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/enrollments - Assign course to user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { user_id, course_id, status, expires_at } = body

    if (!user_id || !course_id) {
      return NextResponse.json(
        { success: false, error: 'user_id and course_id are required' },
        { status: 400 },
      )
    }

    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        {
          user_id,
          course_id,
          status: status || 'active',
          expires_at: expires_at || null,
        },
        { onConflict: 'user_id,course_id' },
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
