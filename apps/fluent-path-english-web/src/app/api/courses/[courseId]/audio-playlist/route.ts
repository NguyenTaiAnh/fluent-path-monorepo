import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/services/supabaseAdmin'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await context.params
    const supabase = createAdminClient()

    const { data: course, error } = await supabase
      .from('courses')
      .select(
        `
        id,
        title,
        thumbnail_url,
        sections (
          id,
          title,
          order_index,
          lessons (
            id,
            title,
            order_index,
            lesson_type,
            lesson_media (
              id,
              media_type,
              url,
              duration_seconds,
              order_index
            )
          )
        )
      `,
      )
      .eq('id', courseId)
      .single()

    if (error) throw error

    // Sort and flatten to audio tracks
    const tracks: {
      lessonId: string
      title: string
      sectionTitle: string
      audioUrl: string
      duration: number | null
    }[] = []

    if (course?.sections) {
      const sections = [...course.sections].sort(
        (a, b) => a.order_index - b.order_index,
      )

      for (const section of sections) {
        if (!section.lessons) continue
        const lessons = [...section.lessons].sort(
          (a, b) => a.order_index - b.order_index,
        )

        for (const lesson of lessons) {
          const media = (lesson as { lesson_media?: { id: string; media_type: string; url: string; duration_seconds: number | null; order_index: number }[] }).lesson_media
          if (!media?.length) continue

          const audioMedia = [...media]
            .sort((a, b) => a.order_index - b.order_index)
            .find((m) => m.media_type === 'audio')

          if (audioMedia) {
            tracks.push({
              lessonId: lesson.id,
              title: lesson.title,
              sectionTitle: section.title,
              audioUrl: audioMedia.url,
              duration: audioMedia.duration_seconds,
            })
          }
        }
      }
    }

    return NextResponse.json({
      courseId: course.id,
      courseTitle: course.title,
      thumbnailUrl: course.thumbnail_url,
      totalTracks: tracks.length,
      tracks,
    })
  } catch (error) {
    console.error('Error fetching audio playlist:', error)
    return NextResponse.json({ error: 'Failed to fetch audio playlist' }, { status: 500 })
  }
}
