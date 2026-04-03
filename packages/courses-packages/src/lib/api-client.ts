/**
 * TA English — Shared API Client
 * @author Nguyễn Tài Anh (Leon Nguyen) developer
 *
 * Usage: import { createApiClient } from 'my-libs/lib'
 * Configure once at app startup, then call anywhere.
 */

export interface ApiClientConfig {
  /** Base URL of the Next.js web app, e.g. https://ta-english.com */
  baseUrl: string;
  /** Function that returns the current auth token (JWT / Supabase access_token) */
  getToken?: () => string | null | Promise<string | null>;
  /** Extra default headers */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

// ─── Internal singleton ───────────────────────────────────────────────────────

let _config: ApiClientConfig | null = null;

export function configureApiClient(config: ApiClientConfig): void {
  _config = config;
}

export function getApiConfig(): ApiClientConfig {
  if (!_config) {
    throw new Error(
      '[TA English API] Client not configured. Call configureApiClient() at app startup.',
    );
  }
  return _config;
}

// ─── Core fetcher ─────────────────────────────────────────────────────────────

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const config = getApiConfig();
  const { params, body, headers: extraHeaders, ...init } = options;

  // Build URL with query params
  const url = new URL(path, config.baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  // Auth header
  const token = config.getToken ? await config.getToken() : null;
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Build request init
  const requestInit: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
      ...authHeader,
      ...(extraHeaders as Record<string, string> | undefined),
    },
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url.toString(), requestInit);
    const contentType = res.headers.get('content-type') || '';

    let data: T | null = null;
    let error: string | null = null;

    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (res.ok) {
        data = json as T;
      } else {
        error = (json as { error?: string; message?: string }).error
          ?? (json as { error?: string; message?: string }).message
          ?? `HTTP ${res.status}`;
      }
    } else if (!res.ok) {
      error = `HTTP ${res.status}: ${res.statusText}`;
    }

    return { data, error, status: res.status, ok: res.ok };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: message, status: 0, ok: false };
  }
}
