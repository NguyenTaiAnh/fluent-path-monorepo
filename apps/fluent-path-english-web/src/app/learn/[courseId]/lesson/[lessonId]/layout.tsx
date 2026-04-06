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
  Menu,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Section, Lesson } from 'my-libs'
import React, { useEffect } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { useDictionary } from '@/i18n/DictionaryProvider'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()
  const { activeSection, setActiveSection, completedSections, syncCompletedSections } =
    useLessonStore()
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, toggleMobileSidebar, closeMobileSidebar } = useUIStore()
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

  // Close mobile sidebar on transition
  useEffect(() => {
    closeMobileSidebar()
  }, [pathname, activeSection, closeMobileSidebar])

  const renderSidebarContent = (isMobile = false, onClose?: () => void) => (
    <div className="flex flex-col grow border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 pt-5 overflow-y-auto">
      <div
        className={cn(
          'flex items-center px-4 mb-5 gap-3',
          (!isMobile && isSidebarCollapsed) ? 'justify-center' : '',
        )}
      >
        <Link
          href={`/my-courses/${params.courseId}`}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 shrink-0"
          title="Back to Course"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {(!isSidebarCollapsed || isMobile) && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate flex-1">
            {currentSection?.title || dict.learning?.loading || 'Loading...'}
          </h1>
        )}
        {isAdmin && (!isSidebarCollapsed || isMobile) && (
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
        {isAdmin && isSidebarCollapsed && !isMobile && (
          <Link
            href={`/admin/courses/${params.courseId}`}
            target="_blank"
            title="Admin View"
            className="p-1.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-colors"
          >
            <Shield className="h-4 w-4" />
          </Link>
        )}
        {isMobile && (
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg shrink-0">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute top-5 -right-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 rounded-full p-1 shadow-sm hover:text-indigo-600 dark:hover:text-indigo-400 z-50 transition-transform hidden md:flex items-center justify-center"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}

      <div className="flex-1 px-3 space-y-1">
        {/* Overview Item */}
        <button
          onClick={() => { setActiveSection('overview'); onClose?.(); }}
          className={cn(
            activeSection === 'overview'
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
            'group flex w-full items-center px-2 py-3 text-sm font-medium rounded-md',
            (!isMobile && isSidebarCollapsed) && 'justify-center',
          )}
          title={(!isMobile && isSidebarCollapsed) ? dict.learning?.overview || 'Overview' : undefined}
        >
          <Layout className={cn('shrink-0 h-6 w-6', !(!isMobile && isSidebarCollapsed) && 'mr-3')} />
          {!(!isMobile && isSidebarCollapsed) && (
            <span className="flex-1 text-left">{dict.learning?.overview || 'Overview'}</span>
          )}
        </button>

        {isLoading ? (
          <div
            className={cn(
              'px-3 py-4 text-sm text-gray-500',
              (!isMobile && isSidebarCollapsed) && 'text-center',
            )}
          >
            {(!isMobile && isSidebarCollapsed) ? '...' : dict.learning?.loading || 'Loading modules...'}
          </div>
        ) : (
          currentSection?.lessons?.map((part: Lesson) => {
            const isCurrent = activeSection === part.id
            const isCompleted = completedSections[`${params.lessonId}_${part.id}`]
            const Icon = typeToIcon[part.lesson_type] || BookOpen

            return (
              <button
                key={part.id}
                onClick={() => { setActiveSection(part.id); onClose?.(); }}
                className={cn(
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                  'group flex w-full items-center px-2 py-3 text-sm font-medium rounded-md relative',
                  (!isMobile && isSidebarCollapsed) && 'justify-center',
                )}
                title={(!isMobile && isSidebarCollapsed) ? part.title : undefined}
              >
                <Icon
                  className={cn(
                     isCurrent
                       ? 'text-indigo-700 dark:text-indigo-400'
                       : 'text-gray-400 group-hover:text-gray-500',
                     'shrink-0 h-6 w-6',
                     !(!isMobile && isSidebarCollapsed) && 'mr-3',
                   )}
                  aria-hidden="true"
                />
                {!(!isMobile && isSidebarCollapsed) && (
                  <span className="flex-1 text-left truncate">{part.title}</span>
                )}
                {isCompleted && (
                  <CheckCircle2
                    className={cn(
                      'h-5 w-5 text-green-500 shrink-0',
                      !(!isMobile && isSidebarCollapsed) ? 'ml-3' : 'absolute top-1 right-1 h-3 w-3',
                    )}
                  />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
           'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300',
           isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {renderSidebarContent(true, closeMobileSidebar)}
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex md:flex-col transition-all duration-300 relative',
          isSidebarCollapsed ? 'md:w-20' : 'md:w-80',
        )}
      >
        {renderSidebarContent(false)}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden relative">
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0 shadow-sm z-30">
          <Link
            href={`/my-courses/${params.courseId}`}
            className="p-1.5 -ml-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="font-bold text-[15px] text-gray-900 dark:text-white truncate flex-1 text-center px-4">
            {currentSection?.title || 'Loading...'}
          </div>
          <button
            onClick={toggleMobileSidebar}
            className="p-1.5 -mr-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Content Body */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="p-4 sm:py-6 sm:px-6 lg:px-8 h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
