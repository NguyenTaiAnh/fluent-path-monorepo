'use client'

import Link from 'next/link'
import Image from 'next/image'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Headphones, Music, Disc3 } from 'lucide-react'
import { useDictionary } from '@/i18n/DictionaryProvider'

interface CourseItem {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  level: string
  totalLessons: number
}

export default function AudioCoursesPage() {
  const { data: courses, isLoading } = useSWR<CourseItem[]>('/api/courses', fetcher)
  const dict = useDictionary()
  const t = dict?.audioCourses || {}

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 sm:mb-10 px-4 sm:px-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 sm:p-2.5 rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white pb-1">{t.title || 'Audio Library'}</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 ml-[44px] sm:ml-[52px]">
          {t.subtitle || 'Choose a course album to start listening. Learn on-the-go with sequential audio playback.'}
        </p>
      </div>

      {/* Course Grid */}
      <div className="px-4 sm:px-0">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl mb-3" />
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : !courses?.length ? (
          <div className="text-center py-12 sm:py-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 mx-4 sm:mx-0">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-50 dark:bg-gray-900 mb-3 sm:mb-4">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t.no_courses || 'No courses available'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {t.no_courses_desc || 'Audio courses will appear here once they are published.'}
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/audio-courses/${course.id}`}
              className="group block"
            >
              {/* Album Art Card */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 bg-gray-100 dark:bg-gray-800">
                <Image
                  src={course.thumbnail_url || '/default-course-thumbnail.png'}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-2xl backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600 ml-0.5 sm:ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Bottom info on card */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-white/90 text-[10px] sm:text-xs font-medium">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <Disc3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{course.totalLessons} {t.lessons || 'lessons'}</span>
                    </div>
                    <span className="text-white/50 hidden lg:inline">•</span>
                    <span className="capitalize w-full lg:w-auto mt-0.5 lg:mt-0">{course.level}</span>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="mt-2.5 sm:mt-3 px-1">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
