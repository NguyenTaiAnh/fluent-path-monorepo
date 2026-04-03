import { NextResponse } from 'next/server'
import { getPublishedCourses } from '@/services/courseService'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const courses = await getPublishedCourses(user?.id)

    const mappedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      level: course.level || 'All Levels',
      totalLessons: course.totalLessons ?? 0,
      enrolled_users: course.enrolled_users ?? 0,
      progress: course.progress ?? 0,
    }))

    return NextResponse.json(mappedCourses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
