'use client'

import React from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Section, Lesson } from 'my-libs'
import Link from 'next/link'
import Image from 'next/image'
import { PlayCircle, CheckCircle2, Circle, Clock, BookOpen, Layers } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'

const DEFAULT_THUMBNAIL = '/default-course-thumbnail.png'

export default function CourseDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>
}) {
  const params = React.use(paramsPromise)
  const { data: course, error, isLoading } = useSWR(`/api/courses/${params.courseId}`, fetcher)

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <EmptyState
        variant="courses"
        title="Failed to load course"
        message="This course could not be found or there was an error loading it."
        action={
          <Link
            href="/courses"
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Back to Courses
          </Link>
        }
      />
    )
  }

  const hasNoSections = !course.sections || course.sections.length === 0

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl">
        <div className="absolute inset-0">
          <Image
            src={course.thumbnail_url || DEFAULT_THUMBNAIL}
            alt={course.title}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-gray-900/40" />
        </div>

        <div className="relative px-8 py-16 sm:px-12 sm:py-24">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="rounded-full bg-indigo-500/80 px-4 py-1.5 text-sm font-bold tracking-wide uppercase">
              {course.level || 'Intermediate'}
            </span>
            <span className="flex items-center gap-1.5 text-gray-300">
              <BookOpen className="h-5 w-5" /> {course.sections?.length || 0} Sections
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
            {course.title}
          </h1>

          <p className="max-w-2xl text-lg text-gray-300 leading-relaxed mb-10">
            {course.description || 'Master English with Effortless English method.'}
          </p>

          <div className="flex items-center gap-6">
            {!hasNoSections && (
              <Link
                href={`/learn/${course.id}/lesson/${course.sections[0]?.id}`}
                className="inline-flex items-center gap-3 rounded-full bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-indigo-500 transition-all hover:scale-105"
              >
                {(course.progress || 0) > 0 ? 'Resume Course' : 'Start Learning Now'}
                <PlayCircle className="h-6 w-6" />
              </Link>
            )}

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-400">Your Progress</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-32 h-2 rounded-full bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${course.progress || 0}%` }}
                  />
                </div>
                <span className="text-lg font-bold">{course.progress || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson List Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <Layers className="h-8 w-8 text-indigo-500" />
            Course Curriculum
          </h2>
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            {course.sections?.length || 0} Sections Total
          </span>
        </div>

        {hasNoSections ? (
          <EmptyState
            variant="lessons"
            title="No sections available"
            message="This course doesn't have any sections yet. The instructor may still be preparing the content."
          />
        ) : (
          <div className="grid gap-4">
            {course.sections.map((section: Section, index: number) => (
              <Link
                key={section.id}
                href={`/learn/${course.id}/lesson/${section.id}`}
                className="group flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                    <span className="text-lg font-bold text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {index + 1}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {section.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" /> ~20 mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        {section.lessons?.length || 0} activities
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {section.lessons?.every((l: Lesson) =>
                    course.completedLessonIds?.includes(l.id),
                  ) ? (
                    <CheckCircle2 className="h-7 w-7 text-green-500" />
                  ) : (
                    <Circle className="h-7 w-7 text-gray-200 dark:text-gray-700 group-hover:text-indigo-200 dark:group-hover:text-indigo-900" />
                  )}
                  <PlayCircle className="h-6 w-6 text-gray-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
