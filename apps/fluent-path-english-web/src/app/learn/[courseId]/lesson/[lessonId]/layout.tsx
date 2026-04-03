'use client'

import { useLessonStore } from '@/store/useLessonStore'
import {
  BookOpen,
  Headphones,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  Play,
  Layout,
  FileText,
  Video,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Section, Lesson } from 'my-libs'
import React, { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { useDictionary } from '@/i18n/DictionaryProvider'

const typeToIcon: Record<string, React.ElementType> = {
  listen: Headphones,
  slow: Play,
  vocab: BookOpen,
  quiz: HelpCircle,
  read: FileText,
  video: Video,
}

export default function LearningLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const params = React.use(paramsPromise)
  const { activeSection, setActiveSection, completedSections, syncCompletedSections } =
    useLessonStore()
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  const dict = useDictionary()
  const { data: course, isLoading } = useSWR(`/api/courses/${params.courseId}`, fetcher)
  const { data: me } = useSWR('/api/me', fetcher)
  const isAdmin = me?.role === 'admin'

  const currentSection = course?.sections?.find((s: Section) => s.id === params.lessonId)

  // Auto-set first active section
  useEffect(() => {
    if (
      currentSection?.lessons &&
      currentSection.lessons.length > 0 &&
      activeSection === 'overview'
    ) {
      // Keep overview as default
    }
  }, [currentSection, activeSection, setActiveSection])

  // Sync DB progress to Zustand store
  useEffect(() => {
    if (course?.completedLessonIds) {
      syncCompletedSections(course.completedLessonIds, params.lessonId)
    }
  }, [course, syncCompletedSections, params.lessonId])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={cn(
          'hidden md:flex md:flex-col transition-all duration-300 relative',
          isSidebarCollapsed ? 'md:w-20' : 'md:w-80',
        )}
      >
        <div className="flex flex-col grow border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pt-5 overflow-y-auto">
          <div
            className={cn(
              'flex items-center px-4 mb-5 gap-3',
              isSidebarCollapsed ? 'justify-center' : '',
            )}
          >
            <Link
              href={`/my-courses/${params.courseId}`}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 shrink-0"
              title="Back to Course"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {!isSidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate flex-1">
                {currentSection?.title || dict.learning?.loading || 'Loading...'}
              </h1>
            )}
            {isAdmin && !isSidebarCollapsed && (
              <Link
                href={`/admin/courses/${params.courseId}`}
                target="_blank"
                title="Admin View"
                className="shrink-0 flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
            {isAdmin && isSidebarCollapsed && (
              <Link
                href={`/admin/courses/${params.courseId}`}
                target="_blank"
                title="Admin View"
                className="p-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-colors"
              >
                <Shield className="h-4 w-4" />
              </Link>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="absolute top-5 -right-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-full p-1 shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 z-50 transition-transform"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 px-3 space-y-1">
            {/* Overview Item */}
            <button
              onClick={() => setActiveSection('overview')}
              className={cn(
                activeSection === 'overview'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                'group flex w-full items-center px-2 py-3 text-sm font-medium rounded-md',
                isSidebarCollapsed && 'justify-center',
              )}
              title={isSidebarCollapsed ? dict.learning?.overview || 'Overview' : undefined}
            >
              <Layout className={cn('shrink-0 h-6 w-6', !isSidebarCollapsed && 'mr-3')} />
              {!isSidebarCollapsed && (
                <span className="flex-1 text-left">{dict.learning?.overview || 'Overview'}</span>
              )}
            </button>

            {isLoading ? (
              <div
                className={cn(
                  'px-3 py-4 text-sm text-gray-500',
                  isSidebarCollapsed && 'text-center',
                )}
              >
                {isSidebarCollapsed ? '...' : dict.learning?.loading || 'Loading modules...'}
              </div>
            ) : (
              currentSection?.lessons?.map((part: Lesson) => {
                const isCurrent = activeSection === part.id
                const isCompleted = completedSections[`${params.lessonId}_${part.id}`]
                const Icon = typeToIcon[part.lesson_type] || BookOpen

                return (
                  <button
                    key={part.id}
                    onClick={() => setActiveSection(part.id)}
                    className={cn(
                      isCurrent
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                      'group flex w-full items-center px-2 py-3 text-sm font-medium rounded-md relative',
                      isSidebarCollapsed && 'justify-center',
                    )}
                    title={isSidebarCollapsed ? part.title : undefined}
                  >
                    <Icon
                      className={cn(
                        isCurrent
                          ? 'text-indigo-700 dark:text-indigo-400'
                          : 'text-gray-400 group-hover:text-gray-500',
                        'shrink-0 h-6 w-6',
                        !isSidebarCollapsed && 'mr-3',
                      )}
                      aria-hidden="true"
                    />
                    {!isSidebarCollapsed && (
                      <span className="flex-1 text-left truncate">{part.title}</span>
                    )}
                    {isCompleted && (
                      <CheckCircle2
                        className={cn(
                          'h-5 w-5 text-green-500',
                          !isSidebarCollapsed ? 'ml-3' : 'absolute top-1 right-1 h-3 w-3',
                        )}
                      />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6 sm:px-6 lg:px-8 h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
