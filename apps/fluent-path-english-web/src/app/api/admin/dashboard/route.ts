import { NextResponse } from 'next/server'
import { createServiceClient } from '@/utils/supabase/service'

/**
 * GET /api/admin/dashboard
 * Returns dashboard statistics for the admin panel.
 */
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Run all queries in parallel for speed
    const [
      { count: totalUsers },
      { count: totalCourses },
      { count: totalSections },
      { count: totalLessons },
      { count: totalEnrollments },
      { count: newUsersThisWeek },
      { count: newEnrollmentsThisWeek },
      { data: recentCourses },
      { data: recentActivity },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('sections').select('*', { count: 'exact', head: true }),
      supabase.from('lessons').select('*', { count: 'exact', head: true }),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .gte('enrolled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase
        .from('courses')
        .select(
          'id, title, slug, level, status, thumbnail_url, enrolled_count, created_at, sections(lessons(id))',
        )
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('activity_logs')
        .select('id, action, resource_type, created_at, user_id, profiles!user_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Top courses by enrollment
    const { data: topCoursesRaw } = await supabase
      .from('courses')
      .select('id, title, enrolled_count, sections(lessons(id))')
      .eq('status', 'published')
      .order('enrolled_count', { ascending: false })
      .limit(5)

    // Compute lesson count from live nested data
    type RawCourse = {
      id: string
      title: string
      slug?: string
      level?: string
      status?: string
      thumbnail_url?: string
      enrolled_count?: number
      created_at?: string
      sections?: Array<{ lessons?: Array<{ id: string }> }>
    }
    const computeLessons = (c: RawCourse) =>
      c.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ?? 0

    const recentCoursesMapped = (recentCourses as RawCourse[] | null)?.map((c) => ({
      ...c,
      total_lessons: computeLessons(c),
      sections: undefined,
    }))

    const topCourses = (topCoursesRaw as RawCourse[] | null)?.map((c) => ({
      ...c,
      total_lessons: computeLessons(c),
      sections: undefined,
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers: totalUsers ?? 0,
          totalCourses: totalCourses ?? 0,
          totalSections: totalSections ?? 0,
          totalLessons: totalLessons ?? 0,
          totalEnrollments: totalEnrollments ?? 0,
          newUsersThisWeek: newUsersThisWeek ?? 0,
          newEnrollmentsThisWeek: newEnrollmentsThisWeek ?? 0,
        },
        recentCourses: recentCoursesMapped ?? [],
        recentActivity: recentActivity ?? [],
        topCourses: topCourses ?? [],
      },
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 },
    )
  }
}
