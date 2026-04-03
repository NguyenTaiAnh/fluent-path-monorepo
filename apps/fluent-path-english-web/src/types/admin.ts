export interface CourseRef {
  id: string
  title: string
}

export interface SectionRef {
  id: string
  title: string
  course_id: string
  courses: CourseRef
}

export interface SectionItem {
  id: string
  title: string
  slug: string
  description: string | null
  course_id: string
  order_index: number
  total_lessons: number
  courses: CourseRef | null
}

export interface LessonItem {
  id: string
  title: string
  slug: string
  lesson_type: string
  order_index: number
  is_free: boolean
  section_id: string
  sections: SectionRef
  lesson_media: Array<{ count: number }>
}

export interface LessonMediaItem {
  id: string
  lesson_id: string
  media_type: string
  title: string | null
  url: string
  source_type: string
  order_index: number
}

export interface VocabularyItem {
  id: string
  word: string
  phonetic: string | null
  meaning_vi: string | null
  example_sentence: string | null
}

export interface LessonDetail {
  id: string
  title: string
  lesson_type: string
  is_free: boolean
  sections: {
    id: string
    title: string
    courses: { id: string; title: string }
  }
  lesson_media: LessonMediaItem[]
  vocabularies: VocabularyItem[]
}

export interface EnrollmentProfile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
}

export interface EnrollmentCourse {
  id: string
  title: string
  level: string
}

export interface EnrollmentAdminItem {
  id: string
  user_id: string
  course_id: string
  status: string
  enrolled_at: string
  profiles: EnrollmentProfile
  courses: EnrollmentCourse
}

export interface PartialUserItem {
  id: string
  full_name: string | null
  email: string
}
