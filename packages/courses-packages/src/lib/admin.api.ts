import { apiFetch } from './api-client';
import type { Course, Section, Lesson, LessonMedia } from '../types/course';
import type { UserWithAuth } from '../types/user';
import type { PaginatedResponse } from '../types/api';

// ─── QUERY PARAMS TYPES ──────────────────────────────────────────────────────

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface AdminCourseParams extends AdminListParams {
  status?: 'all' | 'published' | 'draft' | 'archived';
  level?: string;
}

export interface AdminLessonParams extends AdminListParams {
  section_id?: string;
}

export interface AdminSectionParams extends AdminListParams {
  course_id?: string;
}

export interface AdminUserParams extends AdminListParams {
  role?: 'all' | 'user' | 'admin';
}

// ─── DASHBOARD STAT TYPES ────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  totalRevenue: number;
  recentEnrollments: Array<{
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    course?: { title: string };
  }>;
}

export interface AdminEnrollmentParams extends AdminListParams {
  course_id?: string;
  user_id?: string;
  status?: string;
}

// ─── ADMIN API ────────────────────────────────────────────────────────────────

/**
 * Admin-only API endpoints.
 * All routes require the caller to be an authenticated admin.
 *
 * @example
 * import { AdminApi } from 'my-libs/lib';
 *
 * const { data } = await AdminApi.courses.list({ status: 'published', page: 1 });
 */
export const AdminApi = {
  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    /**
     * GET /api/admin/dashboard
     * Returns platform-wide statistics for the admin overview page.
     */
    getStats: () =>
      apiFetch<AdminDashboardStats>('/api/admin/dashboard', { method: 'GET' }),
  },

  // ── Courses ───────────────────────────────────────────────────────────────
  courses: {
    /**
     * GET /api/admin/courses
     * Returns paginated list of all courses (any status).
     */
    list: (params?: AdminCourseParams) =>
      apiFetch<PaginatedResponse<Course>>('/api/admin/courses', {
        method: 'GET',
        params: params as Record<string, string | number | boolean | undefined | null>,
      }),

    /**
     * GET /api/admin/courses/:id
     * Returns a single course with full details.
     */
    get: (id: string) =>
      apiFetch<Course>(`/api/admin/courses/${id}`, { method: 'GET' }),

    /**
     * POST /api/admin/courses
     * Creates a new course. Requires: title, level.
     */
    create: (body: Partial<Course>) =>
      apiFetch<Course>('/api/admin/courses', { method: 'POST', body }),

    /**
     * PATCH /api/admin/courses/:id
     * Updates fields of an existing course.
     */
    update: (id: string, body: Partial<Course>) =>
      apiFetch<Course>(`/api/admin/courses/${id}`, { method: 'PATCH', body }),

    /**
     * DELETE /api/admin/courses/:id
     * Deletes a course permanently.
     */
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/courses/${id}`, { method: 'DELETE' }),
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  sections: {
    /**
     * GET /api/admin/sections?course_id=
     * Returns paginated sections, optionally filtered by course.
     */
    list: (params?: AdminSectionParams) =>
      apiFetch<PaginatedResponse<Section>>('/api/admin/sections', {
        method: 'GET',
        params: params as Record<string, string | number | boolean | undefined | null>,
      }),

    /**
     * GET /api/admin/sections/:id
     */
    get: (id: string) =>
      apiFetch<Section>(`/api/admin/sections/${id}`, { method: 'GET' }),

    /**
     * POST /api/admin/sections
     * Requires: course_id, title.
     */
    create: (body: Partial<Section>) =>
      apiFetch<Section>('/api/admin/sections', { method: 'POST', body }),

    /**
     * PATCH /api/admin/sections/:id
     */
    update: (id: string, body: Partial<Section>) =>
      apiFetch<Section>(`/api/admin/sections/${id}`, { method: 'PATCH', body }),

    /**
     * DELETE /api/admin/sections/:id
     */
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/sections/${id}`, { method: 'DELETE' }),
  },

  // ── Lessons ───────────────────────────────────────────────────────────────
  lessons: {
    /**
     * GET /api/admin/lessons?section_id=
     * Returns paginated lessons.
     */
    list: (params?: AdminLessonParams) =>
      apiFetch<PaginatedResponse<Lesson>>('/api/admin/lessons', {
        method: 'GET',
        params: params as Record<string, string | number | boolean | undefined | null>,
      }),

    /**
     * GET /api/admin/lessons/:id
     */
    get: (id: string) =>
      apiFetch<Lesson>(`/api/admin/lessons/${id}`, { method: 'GET' }),

    /**
     * POST /api/admin/lessons
     * Requires: section_id, title, lesson_type.
     */
    create: (body: Partial<Lesson>) =>
      apiFetch<Lesson>('/api/admin/lessons', { method: 'POST', body }),

    /**
     * PATCH /api/admin/lessons/:id
     */
    update: (id: string, body: Partial<Lesson>) =>
      apiFetch<Lesson>(`/api/admin/lessons/${id}`, { method: 'PATCH', body }),

    /**
     * DELETE /api/admin/lessons/:id
     */
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/lessons/${id}`, { method: 'DELETE' }),

    // ── Lesson Media ─────────────────────────────────────────────────────────
    media: {
      /**
       * POST /api/admin/lessons/:id/media
       * Adds a media item (audio/video/image) to a lesson.
       */
      add: (lessonId: string, body: Partial<LessonMedia>) =>
        apiFetch<LessonMedia>(`/api/admin/lessons/${lessonId}/media`, {
          method: 'POST',
          body,
        }),

      /**
       * DELETE /api/admin/media/:mediaId
       * Removes a media item by its ID.
       */
      delete: (mediaId: string) =>
        apiFetch<{ success: boolean }>(`/api/admin/media/${mediaId}`, { method: 'DELETE' }),
    },
  },

  // ── Users ─────────────────────────────────────────────────────────────────
  users: {
    /**
     * GET /api/admin/users
     * Returns paginated user list with auth data merged.
     */
    list: (params?: AdminUserParams) =>
      apiFetch<{ success: boolean; data: UserWithAuth[]; total: number }>(
        '/api/admin/users',
        {
          method: 'GET',
          params: params as Record<string, string | number | boolean | undefined | null>,
        },
      ),

    /**
     * PUT /api/admin/users
     * Updates a user's role.
     * Body: { userId: string, role: string }
     */
    updateRole: (userId: string, role: string) =>
      apiFetch<{ success: boolean }>('/api/admin/users', {
        method: 'PUT',
        body: { userId, role },
      }),

    /**
     * DELETE /api/admin/users/:id
     */
    delete: (id: string) =>
      apiFetch<{ success: boolean }>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  },

  // ── Enrollments ───────────────────────────────────────────────────────────
  enrollments: {
    /**
     * GET /api/admin/enrollments
     * Returns paginated list of all user enrollments.
     */
    list: (params?: AdminEnrollmentParams) =>
      apiFetch<PaginatedResponse<unknown>>('/api/admin/enrollments', {
        method: 'GET',
        params: params as Record<string, string | number | boolean | undefined | null>,
      }),
  },

  // ── Upload ────────────────────────────────────────────────────────────────
  upload: {
    /**
     * POST /api/upload/image
     * Uploads an image to Cloudinary via the Next.js API route.
     * Use FormData, not JSON.
     */
    image: (formData: FormData) =>
      apiFetch<{ url: string; public_id: string }>('/api/upload/image', {
        method: 'POST',
        body: formData as unknown,
        headers: {}, // Let browser set multipart/form-data boundary
      }),
  },
};
