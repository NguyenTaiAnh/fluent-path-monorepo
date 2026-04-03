import { ActivityAction } from '../enums/user';

// ─── ACTIVITY LOG ───────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: ActivityAction;
  resource_type: 'course' | 'section' | 'lesson' | 'media' | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── DASHBOARD STATISTICS ───────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalSections: number;
  totalLessons: number;
  totalEnrollments: number;
  activeUsers: number;       // users active in last 30 days
  newUsersThisWeek: number;
  newEnrollmentsThisWeek: number;
}

export interface CourseStats {
  courseId: string;
  courseTitle: string;
  enrolledCount: number;
  completionRate: number;    // percentage
  avgProgress: number;       // average progress percentage
}

export interface DailyActivity {
  date: string;              // YYYY-MM-DD
  loginCount: number;
  lessonPlayCount: number;
  enrollmentCount: number;
}

export interface UserLearningStats {
  totalCoursesEnrolled: number;
  totalLessonsCompleted: number;
  totalTimeSpentSeconds: number;
  currentStreak: number;     // days
  longestStreak: number;
  lastStudiedAt: string | null;
}
