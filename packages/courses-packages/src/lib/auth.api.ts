import { apiFetch } from './api-client';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface MeResponse {
  role: 'guest' | 'user' | 'admin';
  userId?: string;
}

// ─── AUTH API ─────────────────────────────────────────────────────────────────

/**
 * GET /api/me
 * Gets the current user's role and ID.
 * Returns { role: 'guest' } if not logged in.
 *
 * @example
 * const { data } = await AuthApi.getMe();
 * if (data?.role === 'admin') { ... }
 */
export const AuthApi = {
  getMe: () =>
    apiFetch<MeResponse>('/api/me', { method: 'GET' }),
};
