import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ speed: string; partId: string }> },
) {
  const { partId } = await context.params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, get the lesson details to find the content_url
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('content_url, title')
      .eq('id', partId)
      .single()

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    // If lesson has a content_url, try to fetch it from storage
    if (lesson.content_url) {
      // Try to get file from Supabase Storage
      const { data: fileData } = await supabase.storage
        .from('course-content')
        .getPublicUrl(lesson.content_url)

      if (fileData?.publicUrl) {
        // Redirect to the public URL
        return NextResponse.redirect(fileData.publicUrl)
      }
    }

    // If no content_url or storage file not found, return a fallback audio file
    // You could have a default audio file in your public folder
    return NextResponse.json(
      {
        error: 'Audio file not found',
        fallback: '/audio/fallback-listening.mp3', // You should add this file to your public folder
      },
      { status: 404 },
    )
  } catch (error) {
    console.error('Audio API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
