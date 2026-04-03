/**
 * Shared validation utilities for course/lesson data.
 * Usable in both client-side forms and server-side API handlers.
 */

/** Check if a string is non-empty after trimming */
export function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validate a URL string (basic check) */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format seconds to mm:ss display */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Calculate progress percentage (0-100) */
export function calcProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return clamp(Math.round((completed / total) * 100), 0, 100);
}

/** Safely parse a JSON string, returning fallback on failure */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** Generate a slug from a title string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
