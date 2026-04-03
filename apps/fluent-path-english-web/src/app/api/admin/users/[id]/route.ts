import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/users/[id] - User detail with enrollments & progress */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    const [{ data: profile, error: profileError }, { data: enrollments }, { data: progress }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase
          .from('enrollments')
          .select('*, courses(id, title, level, thumbnail_url)')
          .eq('user_id', id),
        supabase
          .from('user_progress')
          .select('*, lessons(id, title, section_id)')
          .eq('user_id', id)
          .eq('is_completed', true),
      ])

    if (profileError) {
      const status = profileError.code === 'PGRST116' ? 404 : 500
      return NextResponse.json({ success: false, error: profileError.message }, { status })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        enrollments: enrollments ?? [],
        completedLessons: progress ?? [],
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/admin/users/[id] - Update user profile (role, active status) */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServiceClient()
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    if (body.role !== undefined) updateData.role = body.role
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.full_name !== undefined) updateData.full_name = body.full_name

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
