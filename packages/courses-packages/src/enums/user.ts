export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export enum ActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  VIEW_COURSE = 'view_course',
  PLAY_LESSON = 'play_lesson',
  COMPLETE_LESSON = 'complete_lesson',
  ENROLL = 'enroll',
  SEARCH = 'search',
  DOWNLOAD = 'download',
}
