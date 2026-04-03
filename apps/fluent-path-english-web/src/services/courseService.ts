import { createAdminClient } from './supabaseAdmin'
import { createClient } from '@/utils/supabase/server'
import type { Course, Section, Lesson, LessonWithMedia } from 'my-libs'

// Extended lesson type returned by API (adds computed fields for backward compat)
export interface LessonWithUrl extends LessonWithMedia {
  content_url: string | null // primary audio URL (from lesson_media)
  pdf_url: string | null // primary PDF URL (from lesson_media)
  lesson_media: LessonWithMedia['media']
}

/** Fetch all published courses with computed totalLessons and progress */
export async function getPublishedCourses(userId?: string) {
  const supabase = createAdminClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      sections (
        id,
        lessons (id)
      )
    `,
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) throw error

  let completedLessonIds = new Set<string>()
  if (userId) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true)

    if (progress) {
      completedLessonIds = new Set(progress.map((p: { lesson_id: string }) => p.lesson_id))
    }
  }

  return (courses ?? []).map((course) => {
    let completedCount = 0
    let totalLessons = 0

    course.sections?.forEach((s: { lessons: { id: string }[] }) => {
      s.lessons?.forEach((l: { id: string }) => {
        totalLessons++
        if (completedLessonIds.has(l.id)) {
          completedCount++
        }
      })
    })

    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

    return {
      ...course,
      totalLessons,
      progress,
      sections: undefined, // Don't leak full sections in list endpoint
    }
  })
}

/** Fetch a single course with nested sections → lessons + lesson_media, sorted by order_index */
export async function getCourseWithSections(courseId: string) {
  const supabaseUser = await createClient()
  const {
    data: { user },
  } = await supabaseUser.auth.getUser()

  const supabase = createAdminClient()
  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      sections (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          lesson_type,
          order_index,
          lesson_media (
            id,
            media_type,
            url,
            source_type,
            title,
            order_index
          )
        )
      )
    `,
    )
    .eq('id', courseId)
    .single()

  if (error) throw error

  // Sort sections and lessons by order_index
  // Also attach primary media URL as content_url for backward compat
  if (course?.sections) {
    course.sections.sort((a: Section, b: Section) => a.order_index - b.order_index)
    course.sections.forEach((section: Section) => {
      if (section.lessons) {
        section.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
        section.lessons.forEach((lesson: Lesson) => {
          const l = lesson as unknown as LessonWithUrl
          const media = l.lesson_media
          if (media?.length) {
            media.sort((a, b) => a.order_index - b.order_index)
            const primaryAudio = media.find((m) => m.media_type === 'audio')
            const primaryPdf = media.find((m) => m.media_type === 'pdf')
            l.content_url = primaryAudio?.url ?? primaryPdf?.url ?? null
            l.pdf_url = primaryPdf?.url ?? null
          }
        })
      }
    })
  }

  // Collect all lesson IDs belonging to this course
  const courseLessonIds = new Set<string>(
    course?.sections?.flatMap(
      (s: { lessons?: { id: string }[] }) => s.lessons?.map((l) => l.id) ?? [],
    ) ?? [],
  )

  // Fetch user progress
  let completedLessonIds: string[] = []
  if (user) {
    const { data: progress } = await supabase
      .from('user_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .eq('is_completed', true)

    if (progress) {
      // Only count lessons that belong to THIS course
      completedLessonIds = progress
        .map((p: { lesson_id: string }) => p.lesson_id)
        .filter((id: string) => courseLessonIds.has(id))
    }
  }

  // Calculate progress
  const totalLessons = courseLessonIds.size

  const progress =
    totalLessons > 0 ? Math.round((completedLessonIds.length / totalLessons) * 100) : 0

  return { ...course, completedLessonIds, progress }
}

/** Fetch a single course with nested sections → lessons + lesson_media, sorted by order_index using slug */
export async function getCourseBySlugWithSections(slug: string) {
  const supabase = createAdminClient()
  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      sections (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          lesson_type,
          order_index,
          lesson_media (
            id,
            media_type,
            url,
            source_type,
            title,
            order_index
          )
        )
      )
    `,
    )
    .eq('slug', slug)
    .single()

  if (error) throw error

  // Sort sections and lessons by order_index
  if (course?.sections) {
    course.sections.sort((a: Section, b: Section) => a.order_index - b.order_index)
    course.sections.forEach((section: Section) => {
      if (section.lessons) {
        section.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
      }
    })
  }

  // Calculate total lessons
  const totalLessons = course?.sections?.reduce(
    (acc: number, s: Section) => acc + (s.lessons?.length || 0),
    0,
  )

  return { ...course, totalLessons }
}

/** Admin: Fetch all courses with sections (for admin panel) */
export async function getAdminCourses() {
  const supabase = createAdminClient()

  const { data: courses, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      sections (
        id,
        title,
        order_index,
        lessons (id, title, lesson_type, content_url, order_index)
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return courses ?? []
}

/** Admin: Create a course with optional sections and lessons */
export async function createCourse(data: {
  title: string
  description?: string
  level: string
  thumbnail_url?: string
  sections?: {
    title: string
    lessons?: { title: string; lesson_type: string; content_url?: string }[]
  }[]
}) {
  const supabase = createAdminClient()

  // Create course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: data.title,
      description: data.description,
      level: data.level,
      thumbnail_url: data.thumbnail_url || null,
      status: 'draft',
    })
    .select()
    .single()

  if (courseError) throw courseError

  // Create sections if provided
  if (data.sections?.length) {
    for (let i = 0; i < data.sections.length; i++) {
      const sectionInput = data.sections[i]

      const { data: section, error: sectionError } = await supabase
        .from('sections')
        .insert({
          course_id: course.id,
          title: sectionInput.title,
          order_index: i,
        })
        .select()
        .single()

      if (sectionError) {
        console.error('Error creating section:', sectionError)
        continue
      }

      if (sectionInput.lessons?.length && section) {
        const lessonsData = sectionInput.lessons.map((lesson, lessonIndex) => ({
          section_id: section.id,
          title: lesson.title,
          lesson_type: lesson.lesson_type,
          content_url: lesson.content_url || null,
          order_index: lessonIndex,
        }))

        const { error: lessonsError } = await supabase.from('lessons').insert(lessonsData)

        if (lessonsError) console.error('Error creating lessons:', lessonsError)
      }
    }
  }

  return course
}

/** Admin: Update a course */
export async function updateCourse(
  courseId: string,
  data: Partial<Pick<Course, 'title' | 'description' | 'level' | 'status' | 'thumbnail_url'>>,
) {
  const supabase = createAdminClient()

  const { data: course, error } = await supabase
    .from('courses')
    .update(data)
    .eq('id', courseId)
    .select()
    .single()

  if (error) throw error
  return course
}

/** Admin: Delete a course (cascade deletes sections and lessons) */
export async function deleteCourse(courseId: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('courses').delete().eq('id', courseId)

  if (error) throw error
}
