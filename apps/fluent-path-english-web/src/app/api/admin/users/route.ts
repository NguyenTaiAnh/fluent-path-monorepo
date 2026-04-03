import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { searchParams } = new URL(request.url)

    const search = (searchParams.get('search') || '').toLowerCase()
    const role = searchParams.get('role')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    // 1. Fetch all users from Auth (since we need email & last_sign_in_at)
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }

    const authUsers = authData?.users || []

    // 2. Fetch profiles for roles, full_name, etc
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('*')

    if (profileError) {
      console.error('Failed to fetch profiles:', profileError)
    }

    // 3. Map and merge data
    let mappedUsers = authUsers.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id)
      return {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name || user.user_metadata?.full_name || null,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        role: profile?.role || 'user',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      }
    })

    // 4. In-memory filtering (Search)
    if (search) {
      mappedUsers = mappedUsers.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) || u.full_name?.toLowerCase().includes(search),
      )
    }

    // 5. In-memory filtering (Role)
    if (role && role !== 'all') {
      mappedUsers = mappedUsers.filter((u) => u.role === role)
    }

    // 6. Sort
    mappedUsers.sort((a, b) => {
      const valA = a[sort as keyof typeof a]
      const valB = b[sort as keyof typeof b]

      if (!valA) return order === 'asc' ? -1 : 1
      if (!valB) return order === 'asc' ? 1 : -1

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB)
        return order === 'asc' ? comp : -comp
      }
      return 0
    })

    const total = mappedUsers.length

    // 7. Pagination
    const start = (page - 1) * pageSize
    mappedUsers = mappedUsers.slice(start, start + pageSize)

    return NextResponse.json({
      success: true,
      data: mappedUsers,
      total: total,
    })
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { userId, role } = body

    if (!userId || !role) {
      return NextResponse.json({ success: false, error: 'Missing userId or role' }, { status: 400 })
    }

    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
