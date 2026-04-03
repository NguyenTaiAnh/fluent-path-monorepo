import { apiFetch } from './api-client';
import type { CourseWithSections } from '../types/course';

// ─── RESPONSE TYPES ──────────────────────────────────────────────────────────

export interface CourseListItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  level: string;
  totalLessons: number;
  enrolled_users: number;
  /** Completion percentage (0–100) for the authenticated user, or 0 for guests */
  progress: number;
}

// ─── COURSES API ──────────────────────────────────────────────────────────────

/**
 * Public/user-facing course endpoints.
 *
 * @example
 * import { CoursesApi } from 'my-libs/lib';
 *
 * // List all published courses
 * const { data } = await CoursesApi.list();
 *
 * // Get a single course with its sections + lessons
 * const { data: course } = await CoursesApi.get('course-id-here');
 */
export const CoursesApi = {
  /**
   * GET /api/courses
   * Returns all published courses.
   * If user is logged in, each course will include their progress (%).
   */
  list: () =>
    apiFetch<CourseListItem[]>('/api/courses', { method: 'GET' }),

  /**
   * GET /api/courses/:courseId
   * Returns a single course with all sections and lessons.
   */
  get: (courseId: string) =>
    apiFetch<CourseWithSections>(`/api/courses/${courseId}`, { method: 'GET' }),
};
