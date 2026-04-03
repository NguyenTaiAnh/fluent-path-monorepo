import { getPublishedCourses } from '@/services/courseService'
import { createClient } from '@/utils/supabase/server'
import MyCoursesClient from './MyCoursesClient'

export default async function CoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch courses directly from the DB on the server
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

  return <MyCoursesClient initialCourses={mappedCourses} />
}
