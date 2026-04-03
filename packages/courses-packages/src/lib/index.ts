/**
 * TA English — Shared API Client Library
 * @author Nguyễn Tài Anh (Leon Nguyen) developer
 *
 * ---
 * Entry point for all API clients.
 * Import in your mobile (React Native/Expo) or any client app:
 *
 * ```ts
 * // 1. Configure once at startup (e.g., App.tsx or _layout.tsx on mobile)
 * import { configureApiClient } from 'my-libs/lib';
 * import * as SecureStore from 'expo-secure-store';
 *
 * configureApiClient({
 *   baseUrl: 'https://your-deployed-domain.com',
 *   getToken: () => SecureStore.getItemAsync('supabase_access_token'),
 * });
 *
 * // 2. Use anywhere in your app
 * import { CoursesApi, ProgressApi, AuthApi } from 'my-libs/lib';
 *
 * const { data, error } = await CoursesApi.list();
 * ```
 */

export { configureApiClient, getApiConfig, apiFetch } from './api-client';
export type { ApiClientConfig, RequestOptions, ApiResponse } from './api-client';

export { AuthApi } from './auth.api';
export type { MeResponse } from './auth.api';

export { CoursesApi } from './courses.api';
export type { CourseListItem } from './courses.api';

export { ProgressApi } from './progress.api';
export type { UpdateProgressRequest, UpdateProgressResponse } from './progress.api';

export { AdminApi } from './admin.api';
export type {
  AdminListParams,
  AdminCourseParams,
  AdminLessonParams,
  AdminSectionParams,
  AdminUserParams,
  AdminEnrollmentParams,
  AdminDashboardStats,
} from './admin.api';
