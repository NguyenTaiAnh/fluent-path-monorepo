/**
 * Formatting utilities shared across web and mobile.
 */

/** Format a number as VND currency */
export function formatCurrency(
  amount: number,
  locale: string = 'vi-VN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date string to localized display */
export function formatDate(
  dateString: string,
  locale: string = 'vi-VN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Date(dateString).toLocaleDateString(locale, defaultOptions);
}

/** Format a date string to relative time (e.g. "2 hours ago") */
export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return 'just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  return formatDate(dateString, 'en-US');
}

/** Format seconds to human-readable duration (e.g. "1h 23m", "45m", "2m 30s") */
export function formatDurationLong(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/** Format file size in bytes to human-readable (e.g. "1.5 MB") */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/** Format a number with compact notation (e.g. 1234 → "1.2K") */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num);
}

/** Get initials from a full name (e.g. "Nguyen Tai Anh" → "NA") */
export function getInitials(name: string, maxChars: number = 2): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, maxChars)
    .join('');
}
