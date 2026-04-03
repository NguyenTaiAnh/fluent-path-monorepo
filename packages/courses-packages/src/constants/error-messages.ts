export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password.',

  // Courses
  COURSE_NOT_FOUND: 'Course not found.',
  COURSE_CREATE_FAILED: 'Failed to create course. Please try again.',
  COURSE_UPDATE_FAILED: 'Failed to update course. Please try again.',
  COURSE_DELETE_FAILED: 'Failed to delete course. Please try again.',
  COURSE_TITLE_REQUIRED: 'Course title is required.',
  COURSE_LEVEL_REQUIRED: 'Course level is required.',

  // Lessons
  LESSON_NOT_FOUND: 'Lesson not found.',
  LESSON_EMPTY_CONTENT: 'This lesson has no content yet. Please check back later.',

  // Media
  AUDIO_LOAD_FAILED: 'The audio file could not be loaded. It may be missing or in an unsupported format.',
  VIDEO_LOAD_FAILED: 'The video file could not be loaded. Please check your internet connection.',
  DOCUMENT_LOAD_FAILED: 'The document could not be loaded. The file might be missing or corrupted.',
  API_LOAD_FAILED: 'Failed to load data from the server. Please try again later.',

  // General
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
} as const;
