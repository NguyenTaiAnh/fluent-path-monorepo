import { getPublishedCourses } from '@/services/courseService'
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
import type { Course } from 'my-libs'
import Image from 'next/image'
import { MobileNav } from '@/components/layout/MobileNav'

interface DisplayCourse extends Course {
  totalLessons?: number;
  enrolled_users?: number;
}

export default async function CoursesCatalogPage() {
  const dict = await getDictionary()

  // Fetch only published courses using admin client service to bypass RLS for public read
  const courseList = await getPublishedCourses() as DisplayCourse[]

  // Sort them by order_index just in case
  courseList.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
         {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="flex items-center justify-center h-8 w-8 overflow-hidden rounded-lg">
                <Image src="/icon.png" alt="TAEnglish Logo" width={32} height={32} className="object-cover" unoptimized/>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                TAEnglish
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 transition-colors"
            >
              {dict.landing?.the_method || 'The Method'}
            </Link>
            <Link
              href="/courses"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400 transition-colors"
            >
              {dict.navigation?.courses || 'Courses'}
            </Link>
          </div>

          {/* Desktop auth buttons */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-4 items-center">
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors"
            >
              {dict.landing?.login || 'Log in'}
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {dict.landing?.register || 'Sign up free'}
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <MobileNav dict={{
            the_method: dict.landing?.the_method,
            courses: dict.navigation?.courses,
            login: dict.landing?.login,
            register: dict.landing?.register,
          }} />
        </nav>
      </header>
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
                        {course.totalLessons || 0} {dict.landing?.lessons || 'lessons'}
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
                        <Button variant="outline" className="rounded-full px-6 hover:bg-gray-100 dark:hover:bg-gray-800">
                          Xem chi tiết
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
