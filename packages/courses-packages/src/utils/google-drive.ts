/**
 * Google Drive URL utilities.
 * Convert share links to direct/embed/stream URLs for use in the app.
 */

/**
 * Extract the file ID from various Google Drive URL formats.
 *
 * Supported formats:
 * - https://drive.google.com/file/d/{ID}/view
 * - https://drive.google.com/open?id={ID}
 * - https://drive.google.com/uc?id={ID}
 * - https://drive.google.com/d/{ID}
 */
export function extractGDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Direct download URL */
export function getGDriveDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/** Embed URL (for iframes - PDF viewer, video preview) */
export function getGDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/** Streaming URL for audio/video playback */
export function getGDriveStreamUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/** Thumbnail URL (for images) */
export function getGDriveThumbnailUrl(
  fileId: string,
  size: number = 400,
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export type GDriveUrlType = 'direct' | 'embed' | 'stream' | 'thumbnail';

/**
 * Convert a Google Drive share URL to a usable URL.
 * Returns null if the input is not a valid Google Drive URL.
 */
export function convertGDriveUrl(
  shareUrl: string,
  type: GDriveUrlType = 'direct',
): string | null {
  const fileId = extractGDriveFileId(shareUrl);
  if (!fileId) return null;

  switch (type) {
    case 'direct':
      return getGDriveDirectUrl(fileId);
    case 'embed':
      return getGDriveEmbedUrl(fileId);
    case 'stream':
      return getGDriveStreamUrl(fileId);
    case 'thumbnail':
      return getGDriveThumbnailUrl(fileId);
    default:
      return getGDriveDirectUrl(fileId);
  }
}

/** Check if a URL is a Google Drive URL */
export function isGDriveUrl(url: string): boolean {
  return /drive\.google\.com/.test(url);
}
