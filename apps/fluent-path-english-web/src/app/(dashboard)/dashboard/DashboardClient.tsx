'use client'

import Link from 'next/link'
import { Clock, Award, PlayCircle } from 'lucide-react'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { EmptyState } from '@/components/ui/EmptyState'
import Image from 'next/image'

interface DashboardCourse {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  level: string
  totalLessons: number
  progress: number
}

const DEFAULT_THUMBNAIL = '/default-course-thumbnail.png'

interface DashboardClientProps {
  initialCourses: DashboardCourse[]
}

export default function DashboardClient({ initialCourses: courses }: DashboardClientProps) {
  const dict = useDictionary()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          {dict.dashboard?.welcome || 'Welcome back, Learner!'}
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {dict.dashboard?.subtitle ||
            'Pick up right where you left off and keep improving your English.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
          <Clock className="w-8 h-8 text-indigo-500 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {dict.dashboard?.hours_learned || 'Hours learned'}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
        </div>
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
          <PlayCircle className="w-8 h-8 text-green-500 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {dict.dashboard?.lessons_completed || 'Lessons completed'}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
        </div>
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-950 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800 p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
          <Award className="w-8 h-8 text-yellow-500 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {dict.dashboard?.current_streak || 'Current Streak'}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {dict.dashboard?.continue_learning || 'Continue Learning'}
          </h3>
          <Link
            href="/my-courses"
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            {dict.dashboard?.view_all || 'View all courses'} <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses && courses.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                variant="courses"
                action={
                  <Link
                    href="/my-courses"
                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    Browse Courses
                  </Link>
                }
              />
            </div>
          )}

          {courses?.map((course) => (
            <div
              key={course.id}
              className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={course.thumbnail_url || DEFAULT_THUMBNAIL}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-gray-900/90 px-2.5 py-1 text-xs font-semibold text-gray-900 dark:text-white shadow-sm">
                  {course.level}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1">
                    {course.title}
                  </h4>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {course.progress || 0}%
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {course.totalLessons} {dict.courses?.lessons || 'Lessons'}
                    </span>
                  </div>
                  <div className="mt-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${course.progress || 0}%` }}
                    />
                  </div>
                  <div className="mt-6">
                    <Link
                      href={`/my-courses/${course.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      <PlayCircle className="h-4 w-4" />
                      {(course.progress || 0) > 0
                        ? dict.dashboard?.continue_lesson || 'Continue'
                        : dict.dashboard?.start_course || 'Start Course'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
