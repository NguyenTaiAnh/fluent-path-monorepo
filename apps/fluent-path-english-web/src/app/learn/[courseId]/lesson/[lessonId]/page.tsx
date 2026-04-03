'use client'
import React from 'react'

import { useLessonStore } from '@/store/useLessonStore'
import { ListeningSection } from '@/components/learn/ListeningSection'
import { VocabularySection } from '@/components/learn/VocabularySection'
import { QuizSection } from '@/components/learn/QuizSection'
import { VideoSection } from '@/components/learn/VideoSection'
import { EmptyState } from '@/components/ui/EmptyState'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import type { Section, Lesson } from 'my-libs'
import Link from 'next/link'

export default function LessonPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const params = React.use(paramsPromise)
  const { activeSection, setActiveSection, completedSections, getNextSection } = useLessonStore()
  const { data: course, isLoading } = useSWR(`/api/courses/${params.courseId}`, fetcher)

  // Reset to overview when lesson changes
  React.useEffect(() => {
    setActiveSection('overview')
  }, [params.lessonId, setActiveSection])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  const currentSection = course?.sections?.find((s: Section) => s.id === params.lessonId)

  // Section not found
  if (!currentSection) {
    return (
      <EmptyState
        variant="lessons"
        title="Section not found"
        message="This section does not exist or may have been removed."
        action={
          <Link
            href={`/my-courses/${params.courseId}`}
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Back to Course
          </Link>
        }
      />
    )
  }

  // Section has no lessons (empty content)
  if (!currentSection.lessons || currentSection.lessons.length === 0) {
    return (
      <EmptyState
        variant="lessons"
        title="No content available"
        message="This section doesn't have any lessons yet. The instructor may still be preparing the content. Please check back later."
        action={
          <Link
            href={`/my-courses/${params.courseId}`}
            className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Back to Course
          </Link>
        }
      />
    )
  }

  // Auto-navigate to first incomplete lesson
  const handleStartLearning = () => {
    if (currentSection.lessons && currentSection.lessons.length > 0) {
      const firstIncomplete = currentSection.lessons.find(
        (lesson: Lesson) => !completedSections[`${params.lessonId}_${lesson.id}`],
      )
      const targetLesson = firstIncomplete || currentSection.lessons[0]
      setActiveSection(targetLesson.id)
    }
  }

  // Handle navigation to next section
  const handleSectionComplete = (nextSectionId?: string) => {
    if (nextSectionId) {
      setActiveSection(nextSectionId)
    } else {
      setActiveSection('overview')
    }
  }

  // Find the active part
  const activePart = currentSection.lessons?.find((l: Lesson) => l.id === activeSection)

  const renderSection = () => {
    if (activeSection === 'overview' || !activePart) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 h-full flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {currentSection.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mb-8 text-lg">
            In this lesson, you will practice listening to a conversation, learn key vocabulary, and
            test your knowledge with a quiz.
          </p>
          <button
            onClick={handleStartLearning}
            className="rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-indigo-500 transition-colors"
          >
            Start Learning
          </button>
        </div>
      )
    }

    // Check if active part has no content_url
    if (
      !activePart.content_url &&
      activePart.lesson_type !== 'vocab' &&
      activePart.lesson_type !== 'quiz'
    ) {
      return (
        <EmptyState
          variant="lessons"
          title="Content not available"
          message={`The content for "${activePart.title}" has not been uploaded yet. Please try another section or check back later.`}
          action={
            <button
              onClick={() => {
                const next = getNextSection(
                  params.lessonId,
                  activeSection,
                  currentSection.lessons || [],
                )
                if (next) {
                  setActiveSection(next)
                } else {
                  setActiveSection('overview')
                }
              }}
              className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Skip to Next
            </button>
          }
        />
      )
    }

    const nextSectionId =
      getNextSection(params.lessonId, activeSection, currentSection.lessons || []) ?? undefined

    switch (activePart.lesson_type) {
      case 'listen':
        return (
          <ListeningSection
            key={activePart.id}
            speed="normal"
            lessonId={params.lessonId}
            partId={activePart.id}
            contentUrl={(activePart as { content_url?: string | null }).content_url}
            pdfUrl={(activePart as { pdf_url?: string | null }).pdf_url}
            onComplete={() => handleSectionComplete(nextSectionId)}
          />
        )
      case 'slow':
        return (
          <ListeningSection
            key={activePart.id}
            speed="slow"
            lessonId={params.lessonId}
            partId={activePart.id}
            contentUrl={(activePart as { content_url?: string | null }).content_url}
            pdfUrl={(activePart as { pdf_url?: string | null }).pdf_url}
            onComplete={() => handleSectionComplete(nextSectionId)}
          />
        )
      case 'video':
        return (
          <VideoSection
            key={activePart.id}
            lessonId={params.lessonId}
            partId={activePart.id}
            contentUrl={activePart.content_url}
            onComplete={() => handleSectionComplete(nextSectionId)}
          />
        )
      case 'read':
        return (
          <ListeningSection
            key={activePart.id}
            speed="normal"
            lessonId={params.lessonId}
            partId={activePart.id}
            contentUrl={(activePart as { content_url?: string | null }).content_url}
            pdfUrl={(activePart as { pdf_url?: string | null }).pdf_url}
            onComplete={() => handleSectionComplete(nextSectionId)}
          />
        )
      case 'vocab':
        return (
          <ListeningSection
            key={activePart.id}
            speed="normal"
            lessonId={params.lessonId}
            partId={activePart.id}
            contentUrl={(activePart as { content_url?: string | null }).content_url}
            pdfUrl={(activePart as { pdf_url?: string | null }).pdf_url}
            onComplete={() => handleSectionComplete(nextSectionId)}
          />
        )
      case 'quiz':
        return <QuizSection key={activePart.id} lessonId={params.lessonId} partId={activePart.id} />
      default:
        return (
          <EmptyState
            variant="lessons"
            title="Unsupported content type"
            message={`This lesson type (${activePart.lesson_type}) is not supported yet.`}
          />
        )
    }
  }

  return <div className="h-full max-w-4xl mx-auto">{renderSection()}</div>
}
