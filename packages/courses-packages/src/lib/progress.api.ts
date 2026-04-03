import { apiFetch } from './api-client';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface UpdateProgressRequest {
  lessonId: string;
  isCompleted?: boolean;
}

export interface UpdateProgressResponse {
  success: boolean;
  data?: unknown;
}

// ─── PROGRESS API ─────────────────────────────────────────────────────────────

/**
 * User lesson progress endpoints.
 *
 * @example
 * import { ProgressApi } from 'my-libs/lib';
 *
 * // Mark a lesson as completed
 * await ProgressApi.update({ lessonId: 'abc-123', isCompleted: true });
 */
export const ProgressApi = {
  /**
   * POST /api/progress
   * Creates or updates lesson completion progress for the current user.
   * Requires authentication.
   *
   * Body: { lessonId: string, isCompleted?: boolean }
   */
  update: (body: UpdateProgressRequest) =>
    apiFetch<UpdateProgressResponse>('/api/progress', {
      method: 'POST',
      body,
    }),
};
