/** Centralized API route paths — use these instead of hardcoded strings */
export const API_PATHS = {
  // ─── Auth ─────────────────────────────────────────────────────────
  AUTH_CALLBACK: '/api/auth/callback',

  // ─── Public ───────────────────────────────────────────────────────
  COURSES: '/api/courses',
  COURSE_DETAIL: (slug: string) => `/api/courses/${slug}` as const,
  COURSE_LESSONS: (slug: string) => `/api/courses/${slug}/lessons` as const,

  // ─── User ─────────────────────────────────────────────────────────
  PROFILE: '/api/profile',
  MY_COURSES: '/api/my-courses',
  MY_PROGRESS: '/api/my-progress',
  MY_FAVORITES: '/api/my-favorites',
  MY_STATS: '/api/my-stats',

  // ─── Admin: Dashboard ─────────────────────────────────────────────
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_ANALYTICS: '/api/admin/analytics',

  // ─── Admin: Courses ───────────────────────────────────────────────
  ADMIN_COURSES: '/api/admin/courses',
  ADMIN_COURSE_DETAIL: (id: string) => `/api/admin/courses/${id}` as const,

  // ─── Admin: Sections ──────────────────────────────────────────────
  ADMIN_SECTIONS: '/api/admin/sections',
  ADMIN_SECTION_DETAIL: (id: string) => `/api/admin/sections/${id}` as const,
  ADMIN_COURSE_SECTIONS: (courseId: string) =>
    `/api/admin/courses/${courseId}/sections` as const,

  // ─── Admin: Lessons ───────────────────────────────────────────────
  ADMIN_LESSONS: '/api/admin/lessons',
  ADMIN_LESSON_DETAIL: (id: string) => `/api/admin/lessons/${id}` as const,
  ADMIN_SECTION_LESSONS: (sectionId: string) =>
    `/api/admin/sections/${sectionId}/lessons` as const,

  // ─── Admin: Lesson Media ──────────────────────────────────────────
  ADMIN_LESSON_MEDIA: (lessonId: string) =>
    `/api/admin/lessons/${lessonId}/media` as const,
  ADMIN_MEDIA_DETAIL: (mediaId: string) =>
    `/api/admin/media/${mediaId}` as const,

  // ─── Admin: Vocabularies ──────────────────────────────────────────
  ADMIN_LESSON_VOCAB: (lessonId: string) =>
    `/api/admin/lessons/${lessonId}/vocabularies` as const,
  ADMIN_VOCAB_DETAIL: (vocabId: string) =>
    `/api/admin/vocabularies/${vocabId}` as const,

  // ─── Admin: Users ─────────────────────────────────────────────────
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_DETAIL: (id: string) => `/api/admin/users/${id}` as const,

  // ─── Admin: Enrollments ───────────────────────────────────────────
  ADMIN_ENROLLMENTS: '/api/admin/enrollments',
  ADMIN_ENROLLMENT_DETAIL: (id: string) =>
    `/api/admin/enrollments/${id}` as const,

  // ─── Upload ───────────────────────────────────────────────────────
  UPLOAD_IMAGE: '/api/upload/image',
} as const;
