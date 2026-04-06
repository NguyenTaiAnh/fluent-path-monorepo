'use client'

import React, { useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Section, Lesson } from 'my-libs'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, CheckCircle2, Circle, Clock, BookOpen, Layers, Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { useStudyTime, getSectionTime } from '@/hooks/useStudyTime'

const DEFAULT_THUMBNAIL = '/default-course-thumbnail.png'

import type { CourseDetailDict } from '@/hooks/useStudyTime'



export default function CourseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>
}) {
  const params = React.use(paramsPromise)
  const { data: course, error, isLoading } = useSWR(`/api/courses/${params.courseId}`, fetcher)
  const dict = useDictionary()
  const t: CourseDetailDict = dict?.courseDetail ?? {}

  const totalStudyTime = useStudyTime(course?.sections, t)

  // Count total lessons and completed
  const sections = course?.sections as Section[] | undefined
  const totalLessons = useMemo(() => {
    if (!sections) return 0
    return sections.reduce(
      (sum: number, s: Section) => sum + (s.lessons?.length || 0),
      0,
    )
  }, [sections])

  const completedCount = course?.completedLessonIds?.length || 0

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
        <Skeleton className="h-56 sm:h-80 w-full rounded-2xl sm:rounded-3xl" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-20 w-full rounded-xl sm:rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <EmptyState
        variant="courses"
        title={t.failed_title || 'Failed to load course'}
        message={t.failed_message || 'This course could not be found.'}
        action={
          <Link
            href="/courses"
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            {t.back_to_courses || 'Back to Courses'}
          </Link>
        }
      />
    )
  }

  const hasNoSections = !course.sections || course.sections.length === 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 pb-20 px-4 sm:px-6 lg:px-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 text-white shadow-2xl">
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail_url || DEFAULT_THUMBNAIL}
            alt={course.title}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40" />
        </div>

        <div className="relative px-5 py-10 sm:px-12 sm:py-24">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <span className="rounded-full bg-indigo-500/80 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-bold tracking-wide uppercase">
              {course.level || 'Intermediate'}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              <BookOpen className="h-4 w-4" /> {course.sections?.length || 0} {t.sections || 'Sections'}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              <Clock className="h-4 w-4" /> {totalStudyTime}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-6">
            {course.title}
          </h1>

          <p className="max-w-2xl text-sm sm:text-lg text-gray-300 leading-relaxed mb-6 sm:mb-10 line-clamp-3 sm:line-clamp-none">
            {course.description || 'Master English with TAEnglish method.'}
          </p>

          {/* CTA + Progress — stack on mobile */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {!hasNoSections && (
              <Link
                href={`/learn/${course.id}/lesson/${course.sections[0]?.id}`}
                className="inline-flex items-center gap-2 sm:gap-3 rounded-full bg-indigo-600 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg font-bold text-white shadow-lg hover:bg-indigo-500 transition-all hover:scale-105 w-full sm:w-auto justify-center"
              >
                {(course.progress || 0) > 0
                  ? (t.resume_course || 'Resume Course')
                  : (t.start_learning || 'Start Learning Now')}
                <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            )}

            <div className="flex flex-col w-full sm:w-auto">
              <span className="text-xs sm:text-sm font-medium text-gray-400">{t.your_progress || 'Your Progress'}</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-full sm:w-32 h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
                <span className="text-base sm:text-lg font-bold shrink-0">{course.progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Stats row — mobile: 3 column grid below CTA */}
          <div className="grid grid-cols-3 gap-3 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/10">
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-2xl font-bold">{totalLessons}</div>
              <div className="text-xs sm:text-sm text-gray-400">{t.activities || 'activities'}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-2xl font-bold text-green-400">{completedCount}</div>
              <div className="text-xs sm:text-sm text-gray-400">{t.completed_lessons || 'Completed'}</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-2xl font-bold text-indigo-400">{totalStudyTime}</div>
              <div className="text-xs sm:text-sm text-gray-400">{t.total_time || 'Total Time'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson List Section */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl sm:text-3xl font-bold dark:text-white flex items-center gap-2 sm:gap-3">
            <Layers className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" />
            {t.curriculum || 'Course Curriculum'}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {course.sections?.length || 0} {t.sections_total || 'Sections Total'}
          </span>
        </div>

        {hasNoSections ? (
          <EmptyState
            variant="lessons"
            title={t.no_sections_title || 'No sections available'}
            message={t.no_sections_message || "This course doesn't have any sections yet."}
          />
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {course.sections.map((section: Section, index: number) => {
              const isCompleted = section.lessons?.every((l: Lesson) =>
                course.completedLessonIds?.includes(l.id),
              )
              const completedInSection = section.lessons?.filter((l: Lesson) =>
                course.completedLessonIds?.includes(l.id),
              ).length || 0
              const totalInSection = section.lessons?.length || 0

              return (
                <Link
                  key={section.id}
                  href={`/learn/${course.id}/lesson/${section.id}`}
                  className="group flex w-full min-w-0 items-center justify-between p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                    {/* Section number */}
                    <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                      {isCompleted ? (
                        <Trophy className="h-5 w-5 text-amber-500" />
                      ) : (
                        <span className="text-base sm:text-lg font-bold text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Section info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {section.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-w-0">
                        <span className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5 shrink-0" /> {getSectionTime(section, t)}
                        </span>
                        <span className="shrink-0 whitespace-nowrap">{totalInSection} {t.activities || 'activities'}</span>
                        {completedInSection > 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium shrink-0 whitespace-nowrap">
                            {completedInSection}/{totalInSection}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status icon */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-gray-200 dark:text-gray-700 group-hover:text-indigo-200 dark:group-hover:text-indigo-900" />
                    )}
                    <PlayCircle className="hidden sm:block h-6 w-6 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
