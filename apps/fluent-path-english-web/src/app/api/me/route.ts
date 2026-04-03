import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/services/supabaseAdmin'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ role: 'guest' })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()

    return NextResponse.json({ role: profile?.role ?? 'user', userId: user.id })
  } catch {
    return NextResponse.json({ role: 'user' })
  }
}
