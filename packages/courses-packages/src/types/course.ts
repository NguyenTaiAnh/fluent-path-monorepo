import { CourseLevel, CourseStatus } from '../enums/course';
import { LessonType } from '../enums/lesson';
import { MediaType, MediaSourceType } from '../enums/media';
import { EnrollmentStatus } from '../enums/user';

// ─── COURSE ─────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  level: CourseLevel;
  status: CourseStatus;
  order_index: number;
  price: number;
  original_price: number;
  enrolled_count: number;
  total_lessons: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations (populated via joins)
  sections?: Section[];
  // Computed (populated by API / client)
  completedLessonIds?: string[];
  progress?: number;
}

export interface CourseWithSections extends Course {
  sections: SectionWithLessons[];
}

// ─── SECTION ────────────────────────────────────────────────────────

export interface Section {
  id: string;
  course_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  order_index: number;
  total_lessons: number;
  created_at: string;
  updated_at: string;
  // Relations
  lessons?: Lesson[];
}

export interface SectionWithLessons extends Section {
  lessons: LessonWithMedia[];
}

// ─── LESSON ─────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  slug: string | null;
  description: string | null;
  lesson_type: LessonType;
  order_index: number;
  duration_seconds: number;
  is_free: boolean;
  is_published: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Relations
  media?: LessonMedia[];
  vocabularies?: Vocabulary[];
}

export interface LessonWithMedia extends Lesson {
  media: LessonMedia[];
  vocabularies: Vocabulary[];
}

// ─── LESSON MEDIA ───────────────────────────────────────────────────

export interface LessonMedia {
  id: string;
  lesson_id: string;
  media_type: MediaType;
  title: string | null;
  url: string;
  source_type: MediaSourceType;
  order_index: number;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  mime_type: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── VOCABULARY ─────────────────────────────────────────────────────

export interface Vocabulary {
  id: string;
  lesson_id: string;
  word: string;
  phonetic: string | null;
  meaning_vi: string | null;
  meaning_en: string | null;
  example_sentence: string | null;
  audio_url: string | null;
  order_index: number;
  created_at: string;
}

// ─── ENROLLMENT ─────────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
  expires_at: string | null;
  // Populated via joins
  course?: Course;
}

// ─── USER PROGRESS ──────────────────────────────────────────────────

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  listen_count: number;
  time_spent_seconds: number;
  progress_percent: number;
  last_accessed_at: string;
  completed_at: string | null;
}

// ─── USER FAVORITES ─────────────────────────────────────────────────

export interface UserFavorite {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
  // Populated via joins
  course?: Course;
}

// ─── FORM/INPUT TYPES (for CRUD operations) ─────────────────────────

export interface CourseFormData {
  title: string;
  description?: string;
  level: CourseLevel;
  status: CourseStatus;
  order_index: number;
  price?: number;
  original_price?: number;
  thumbnail_url?: string;
  metadata?: Record<string, unknown>;
}

export interface SectionFormData {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface LessonFormData {
  section_id: string;
  title: string;
  description?: string;
  lesson_type: LessonType;
  order_index: number;
  duration_seconds?: number;
  is_free?: boolean;
  is_published?: boolean;
  metadata?: Record<string, unknown>;
}

export interface LessonMediaFormData {
  lesson_id: string;
  media_type: MediaType;
  title?: string;
  url: string;
  source_type: MediaSourceType;
  order_index: number;
  file_size_bytes?: number;
  duration_seconds?: number;
  mime_type?: string;
  metadata?: Record<string, unknown>;
}

export interface VocabularyFormData {
  lesson_id: string;
  word: string;
  phonetic?: string;
  meaning_vi?: string;
  meaning_en?: string;
  example_sentence?: string;
  audio_url?: string;
  order_index?: number;
}
