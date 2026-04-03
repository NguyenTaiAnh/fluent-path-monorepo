import { UserRole } from '../enums/user';

// ─── PROFILE ────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  role: UserRole;
  preferred_language: 'vi' | 'en';
  preferred_theme: 'light' | 'dark';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Profile joined with auth.users data (for admin views) */
export interface UserWithAuth extends Profile {
  email: string;
  last_sign_in_at: string | null;
  // Computed
  enrolled_courses_count?: number;
  completed_lessons_count?: number;
}

/** Profile form data for update */
export interface ProfileFormData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  preferred_language?: 'vi' | 'en';
  preferred_theme?: 'light' | 'dark';
}
