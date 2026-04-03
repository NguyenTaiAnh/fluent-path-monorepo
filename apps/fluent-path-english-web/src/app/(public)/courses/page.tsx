import { createClient } from '@/utils/supabase/server'
import { getDictionary } from '@/i18n/getDictionary'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Sparkles } from 'lucide-react'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { CourseThumbnail } from '@/components/ui/CourseThumbnail'

export default async function CoursesCatalogPage() {
  const dict = await getDictionary()
  const supabase = await createClient()

  // Fetch only published courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching courses:', error)
  }

  const courseList = courses || []

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
              {dict.navigation?.courses || 'Courses'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium">
              {dict.landing?.subtitle || 'Find the right course to level up your English.'}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courseList.length === 0 ? (
              <div className="col-span-full text-center py-24">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  No courses available
                </h3>
                <p className="text-gray-500">Check back later for new content.</p>
              </div>
            ) : (
              courseList.map((course) => (
                <Card
                  key={course.id}
                  className="group overflow-hidden flex flex-col hover:border-indigo-500/50 transition-colors bg-white dark:bg-gray-900 shadow-sm hover:shadow-md"
                >
                  <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <CourseThumbnail src={course.thumbnail_url} title={course.title} />
                    {course.price === 0 && (
                      <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-transparent">
                        {dict.landing?.free || 'Free'}
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="flex-1 pb-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                      {course.level}
                    </div>
                    <CardTitle className="text-xl line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-SM text-gray-600 dark:text-gray-400">
                      {course.description || 'No description available.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4" />
                        {course.total_lessons || 0} {dict.landing?.lessons || 'lessons'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count || 0}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 border-t border-gray-100 dark:border-gray-800 mt-auto px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {course.price === 0
                          ? dict.landing?.free || 'Free'
                          : `$${course.price / 100}`}
                      </div>
                      <Link href={`/courses/${course.slug}`}>
                        <Button variant="primary" className="rounded-full px-6">
                          {dict.landing?.start_now || 'View Course'}
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
