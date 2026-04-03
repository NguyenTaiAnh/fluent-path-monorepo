'use client'

import Link from 'next/link'
import { PlayCircle, GraduationCap } from 'lucide-react'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { EmptyState } from '@/components/ui/EmptyState'
import { CourseThumbnail } from '@/components/ui/CourseThumbnail'

interface CourseListItem {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  level: string
  totalLessons: number
  enrolled_users: number
  progress: number
}

interface MyCoursesClientProps {
  initialCourses: CourseListItem[]
}

export default function MyCoursesClient({ initialCourses: courses }: MyCoursesClientProps) {
  const dict = useDictionary()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {dict.courses?.title || 'Explore Courses'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {dict.courses?.subtitle || 'Find the right course to improve your English skills.'}
        </p>
      </div>

      {courses && courses.length === 0 && <EmptyState variant="courses" />}

      {courses && courses.length > 0 && (
        <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {courses.map((course) => (
            <article
              key={course.id}
              className="group flex flex-col items-start justify-between rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
            >
              {/* Thumbnail with fallback */}
              <div className="relative h-56 w-full overflow-hidden">
                <CourseThumbnail src={course.thumbnail_url} title={course.title} />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="rounded-full bg-indigo-500/80 px-2.5 py-0.5 font-medium capitalize">
                      {course.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" /> {course.totalLessons}{' '}
                      {dict.courses?.lessons || 'Lessons'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-tight line-clamp-2">{course.title}</h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between p-6 w-full">
                <p className="text-base text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description || 'Start learning today and improve your English skills.'}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.progress || 0}% {dict.courses?.completed || 'Completed'}
                    </span>
                    <div className="mt-1 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-1.5 rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/my-courses/${course.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                  >
                    {(course.progress || 0) > 0 ? 'Continue' : 'Start'}
                    <PlayCircle className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
