import { getPublishedCourses } from '@/services/courseService'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardHome() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch courses directly from the database, eliminating the network request from the client!
  const courses = await getPublishedCourses(user?.id)

  const mappedCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnail_url: course.thumbnail_url,
    level: course.level || 'All Levels',
    totalLessons: course.totalLessons ?? 0,
    progress: course.progress ?? 0,
  }))

  return <DashboardClient initialCourses={mappedCourses} />
}
