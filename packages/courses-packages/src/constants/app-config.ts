/** Application-wide configuration constants */
export const APP_CONFIG = {
  /** App name */
  APP_NAME: 'TAEnglish',

  /** Default locale */
  DEFAULT_LOCALE: 'vi' as const,
  SUPPORTED_LOCALES: ['vi', 'en'] as const,

  /** Default theme */
  DEFAULT_THEME: 'light' as const,

  /** Pagination */
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  /** File upload limits */
  MAX_IMAGE_SIZE_MB: 5,
  MAX_AUDIO_SIZE_MB: 50,
  MAX_VIDEO_SIZE_MB: 200,
  MAX_PDF_SIZE_MB: 20,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],

  /** Cloudinary */
  CLOUDINARY_UPLOAD_PRESET: 'effortless_english',
  CLOUDINARY_FOLDER: 'effortless-english',

  /** Course levels display order */
  LEVEL_ORDER: {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
  } as const,
} as const;
