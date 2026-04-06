import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { createAdminClient } from '@/services/supabaseAdmin'

/**
 * GET /api/transcript/[mediaId]
 * Fetch transcript data for a lesson_media record.
 * Requires authenticated user.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ mediaId: string }> },
) {
  // Require authenticated user
  const auth = await requireAuth()
  if (auth.error) return auth.error

  try {
    const { mediaId } = await context.params
    const supabase = createAdminClient()

    // First try: direct lookup by lesson_media ID
    let { data, error } = await supabase
      .from('lesson_media')
      .select('id, title, metadata')
      .eq('id', mediaId)
      .eq('media_type', 'audio')
      .maybeSingle()

    // Second try: lookup by lesson_id (partId from ListeningSection)
    if (!data && !error) {
      const result = await supabase
        .from('lesson_media')
        .select('id, title, metadata')
        .eq('lesson_id', mediaId)
        .eq('media_type', 'audio')
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle()

      data = result.data
      error = result.error
    }

    if (error) throw error
    if (!data) {
      return NextResponse.json({ transcript: [] })
    }

    const metadata = data.metadata as Record<string, unknown> | null
    const transcript = metadata?.transcript || []

    return NextResponse.json({
      mediaId: data.id,
      title: data.title,
      transcript,
    })
  } catch (error) {
    console.error('Error fetching transcript:', error)
    return NextResponse.json({ transcript: [] })
  }
}
