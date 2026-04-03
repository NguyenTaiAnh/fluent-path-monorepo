import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCourseBySlugWithSections } from '@/services/courseService'
import { getDictionary } from '@/i18n/getDictionary'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseThumbnail } from '@/components/ui/CourseThumbnail'
import { BookOpen, Users, Lock, ChevronLeft, PlayCircle, Headphones, FileText, CheckSquare, MessageCircle, Ear } from 'lucide-react'
import type { Section, Lesson } from 'my-libs'

type PageProps = {
  params: Promise<{ slug: string }>
}

function getLessonIcon(type: string) {
  switch (type) {
    case 'listening': return <Ear className="h-5 w-5 text-indigo-500" />
    case 'vocabulary': return <BookOpen className="h-5 w-5 text-indigo-500" />
    case 'grammar': return <FileText className="h-5 w-5 text-indigo-500" />
    case 'speaking': return <MessageCircle className="h-5 w-5 text-indigo-500" />
    case 'quiz': return <CheckSquare className="h-5 w-5 text-indigo-500" />
    default: return <Headphones className="h-5 w-5 text-indigo-500" />
  }
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const dict = await getDictionary()

  const course = await getCourseBySlugWithSections(slug)

  if (!course) {
    notFound()
  }

  const sections = course.sections || []

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-8">
            <Link href="/courses" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <ChevronLeft className="mr-1 h-4 w-4" />
              {dict.navigation?.courses || 'Back to Courses'}
            </Link>
          </div>

          {/* Hero Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto min-h-[300px] w-full bg-gray-100 dark:bg-gray-800">
                <CourseThumbnail src={course.thumbnail_url} title={course.title} />
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {course.level}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 whitespace-pre-wrap">
                  {course.description || 'No description available for this course.'}
                </p>

                <div className="flex items-center gap-6 mb-8 text-sm text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-800 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-200">{course.totalLessons || 0}</span> {dict.landing?.lessons || 'lessons'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-200">{course.enrolled_count || 0}</span> students
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Course Price</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {course.price === 0 ? (dict.landing?.free || 'Free') : `$${course.price / 100}`}
                    </div>
                  </div>
                  <Link href="/register">
                    <Button variant="primary" size="lg" className="rounded-full shadow-md">
                      {dict.landing?.start_now || 'Sign Up to Enroll'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Course Curriculum</h2>
              <p className="text-gray-500 dark:text-gray-400">Review the topics covered in this course</p>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No content yet</h3>
                <p className="text-gray-500">Curriculum is being prepared for this course.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section: Section, index: number) => (
                  <div key={section.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
                    {/* Section Header */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                          {section.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {section.lessons?.length || 0} items
                        </span>
                      </div>
                    </div>

                    {/* Lesson List (Read-only review mode) */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {!section.lessons?.length ? (
                        <div className="px-6 py-4 text-sm text-gray-500 italic">No items in this section.</div>
                      ) : (
                        section.lessons.map((lesson: Lesson, lessonIdx: number) => (
                          <div 
                            key={lesson.id} 
                            className="px-6 py-4 flex items-center justify-between group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/20"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 opacity-80">
                                {getLessonIcon(lesson.lesson_type)}
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200 block">
                                  {lessonIdx + 1}. {lesson.title}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5 block">
                                  {lesson.lesson_type}
                                </span>
                              </div>
                            </div>
                            
                            {/* Disabled Lock Indicator */}
                            <div 
                              className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                              title="Sign in to access this lesson"
                            >
                              <Lock className="h-4 w-4" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>
  )
}
