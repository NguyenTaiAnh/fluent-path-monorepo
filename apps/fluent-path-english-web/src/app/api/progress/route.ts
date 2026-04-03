import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/services/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, isCompleted } = body

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 })
    }

    let resultData
    let resultError

    const adminClient = createAdminClient()

    const { data: existingArray, error: fetchErr } = await adminClient
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .limit(1)

    if (fetchErr) {
      console.error('Fetch error:', fetchErr)
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    const existing = existingArray?.[0]

    if (existing) {
      const { data, error } = await adminClient
        .from('user_progress')
        .update({
          is_completed: isCompleted ?? true,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
      resultData = data
      resultError = error
    } else {
      const { data, error } = await adminClient.from('user_progress').insert({
        user_id: user.id,
        lesson_id: lessonId,
        is_completed: isCompleted ?? true,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      resultData = data
      resultError = error
    }

    if (resultError) {
      console.error('DB Upsert/Update Error:', resultError)
      return NextResponse.json({ error: resultError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: resultData })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
