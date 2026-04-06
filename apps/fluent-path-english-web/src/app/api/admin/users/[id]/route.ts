import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'

type Params = { params: Promise<{ id: string }> }

/** GET /api/admin/users/[id] - User detail with enrollments & progress */
export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params

    const [{ data: profile, error: profileError }, { data: enrollments }, { data: progress }] =
      await Promise.all([
        auth.supabase.from('profiles').select('*').eq('id', id).single(),
        auth.supabase
          .from('enrollments')
          .select('*, courses(id, title, level, thumbnail_url)')
          .eq('user_id', id),
        auth.supabase
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
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await params
    const body = await request.json()

    // Prevent self-demotion
    if (id === auth.user.id && body.role !== undefined && body.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own admin role' },
        { status: 400 },
      )
    }

    const updateData: Record<string, unknown> = {}
    if (body.role !== undefined) updateData.role = body.role
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.full_name !== undefined) updateData.full_name = body.full_name

    const { data, error } = await auth.supabase
      .from('profiles')
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
