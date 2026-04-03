-- ====================================================================
-- MIGRATION V3: Complete Schema Redesign (Optimized & Scalable)
-- ====================================================================
-- This migration drops the old schema and creates a fresh, optimized one.
-- Run this on a NEW Supabase project.
-- ====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    preferred_language TEXT DEFAULT 'vi' CHECK (preferred_language IN ('vi', 'en')),
    preferred_theme TEXT DEFAULT 'light' CHECK (preferred_theme IN ('light', 'dark')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. COURSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    order_index INTEGER NOT NULL DEFAULT 0,
    price INTEGER DEFAULT 0,
    original_price INTEGER DEFAULT 0,
    enrolled_count INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. SECTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, slug)
);

-- ─────────────────────────────────────────────
-- 4. LESSONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    lesson_type TEXT NOT NULL CHECK (lesson_type IN (
        'listen', 'slow', 'read', 'video', 'vocab',
        'quiz', 'analysis', 'mixed'
    )),
    order_index INTEGER NOT NULL DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(section_id, slug)
);

-- ─────────────────────────────────────────────
-- 5. LESSON_MEDIA
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lesson_media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN (
        'audio', 'video', 'pdf', 'transcript', 'image', 'external_url'
    )),
    title TEXT,
    url TEXT NOT NULL,
    source_type TEXT DEFAULT 'google_drive' CHECK (source_type IN (
        'google_drive', 'supabase', 'external', 'cloudinary'
    )),
    order_index INTEGER NOT NULL DEFAULT 0,
    file_size_bytes INTEGER,
    duration_seconds INTEGER,
    mime_type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. VOCABULARIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vocabularies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    phonetic TEXT,
    meaning_vi TEXT,
    meaning_en TEXT,
    example_sentence TEXT,
    audio_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. ENROLLMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

-- ─────────────────────────────────────────────
-- 8. USER_PROGRESS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    listen_count INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    progress_percent REAL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

-- ─────────────────────────────────────────────
-- 9. USER_FAVORITES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- ─────────────────────────────────────────────
-- 10. ACTIVITY_LOGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN (
        'login', 'logout', 'view_course', 'play_lesson',
        'complete_lesson', 'enroll', 'search', 'download'
    )),
    resource_type TEXT CHECK (resource_type IN ('course', 'section', 'lesson', 'media')),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES
-- ====================================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses(order_index);
CREATE INDEX IF NOT EXISTS idx_courses_status_order ON courses(status, order_index);

-- Sections
CREATE INDEX IF NOT EXISTS idx_sections_course_id ON sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(course_id, order_index);

-- Lessons
CREATE INDEX IF NOT EXISTS idx_lessons_section_id ON lessons(section_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons(lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(section_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_published ON lessons(is_published);

-- Lesson Media
CREATE INDEX IF NOT EXISTS idx_lesson_media_lesson_id ON lesson_media(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_media_type ON lesson_media(media_type);
CREATE INDEX IF NOT EXISTS idx_lesson_media_order ON lesson_media(lesson_id, order_index);

-- Vocabularies
CREATE INDEX IF NOT EXISTS idx_vocabularies_lesson_id ON vocabularies(lesson_id);

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_status ON enrollments(user_id, status);

-- User Progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(user_id, is_completed);

-- User Favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);

-- Activity Logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_recent ON activity_logs(created_at DESC)
    WHERE created_at > NOW() - INTERVAL '30 days';

-- ====================================================================
-- FUNCTIONS & TRIGGERS
-- ====================================================================

-- Auto-update `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['profiles', 'courses', 'sections', 'lessons'])
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
             CREATE TRIGGER update_%s_updated_at
             BEFORE UPDATE ON %s
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
            tbl, tbl, tbl, tbl
        );
    END LOOP;
END $$;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update section.total_lessons when lessons change
CREATE OR REPLACE FUNCTION update_section_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE sections SET total_lessons = (
            SELECT COUNT(*) FROM lessons WHERE section_id = NEW.section_id AND is_published = TRUE
        ) WHERE id = NEW.section_id;
    END IF;
    IF TG_OP = 'DELETE' THEN
        UPDATE sections SET total_lessons = (
            SELECT COUNT(*) FROM lessons WHERE section_id = OLD.section_id AND is_published = TRUE
        ) WHERE id = OLD.section_id;
    END IF;
    -- Also update old section if lesson moved between sections
    IF TG_OP = 'UPDATE' AND OLD.section_id != NEW.section_id THEN
        UPDATE sections SET total_lessons = (
            SELECT COUNT(*) FROM lessons WHERE section_id = OLD.section_id AND is_published = TRUE
        ) WHERE id = OLD.section_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lesson_count ON lessons;
CREATE TRIGGER trg_lesson_count
    AFTER INSERT OR UPDATE OR DELETE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_section_lesson_count();

-- Auto-update course.total_lessons when sections change
CREATE OR REPLACE FUNCTION update_course_total_lessons()
RETURNS TRIGGER AS $$
DECLARE
    v_course_id UUID;
BEGIN
    SELECT course_id INTO v_course_id FROM sections WHERE id = COALESCE(NEW.id, OLD.id);

    IF v_course_id IS NOT NULL THEN
        UPDATE courses SET total_lessons = (
            SELECT COALESCE(SUM(total_lessons), 0)
            FROM sections WHERE course_id = v_course_id
        ) WHERE id = v_course_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_total_lessons ON sections;
CREATE TRIGGER trg_course_total_lessons
    AFTER INSERT OR UPDATE OF total_lessons OR DELETE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_course_total_lessons();

-- Auto-update course.enrolled_count when enrollments change
CREATE OR REPLACE FUNCTION update_course_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE courses SET enrolled_count = (
            SELECT COUNT(*) FROM enrollments
            WHERE course_id = NEW.course_id AND status = 'active'
        ) WHERE id = NEW.course_id;
    END IF;
    IF TG_OP = 'DELETE' THEN
        UPDATE courses SET enrolled_count = (
            SELECT COUNT(*) FROM enrollments
            WHERE course_id = OLD.course_id AND status = 'active'
        ) WHERE id = OLD.course_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enrolled_count ON enrollments;
CREATE TRIGGER trg_enrolled_count
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_course_enrolled_count();

-- ====================================================================
-- HELPER FUNCTION: Check admin role
-- ====================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabularies ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_admin_select" ON profiles
    FOR SELECT USING (is_admin());
CREATE POLICY "profiles_admin_update" ON profiles
    FOR UPDATE USING (is_admin());

-- ── COURSES ──
CREATE POLICY "courses_public_select" ON courses
    FOR SELECT USING (status = 'published');
CREATE POLICY "courses_admin_all" ON courses
    FOR ALL USING (is_admin());

-- ── SECTIONS ──
CREATE POLICY "sections_public_select" ON sections
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM courses WHERE id = course_id AND status = 'published')
    );
CREATE POLICY "sections_admin_all" ON sections
    FOR ALL USING (is_admin());

-- ── LESSONS ──
CREATE POLICY "lessons_public_select" ON lessons
    FOR SELECT USING (
        is_published = TRUE AND
        EXISTS (
            SELECT 1 FROM sections s
            JOIN courses c ON c.id = s.course_id
            WHERE s.id = section_id AND c.status = 'published'
        )
    );
CREATE POLICY "lessons_admin_all" ON lessons
    FOR ALL USING (is_admin());

-- ── LESSON_MEDIA ──
CREATE POLICY "media_public_select" ON lesson_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE l.id = lesson_id
              AND l.is_published = TRUE
              AND c.status = 'published'
        )
    );
CREATE POLICY "media_admin_all" ON lesson_media
    FOR ALL USING (is_admin());

-- ── VOCABULARIES ──
CREATE POLICY "vocab_public_select" ON vocabularies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN sections s ON s.id = l.section_id
            JOIN courses c ON c.id = s.course_id
            WHERE l.id = lesson_id
              AND l.is_published = TRUE
              AND c.status = 'published'
        )
    );
CREATE POLICY "vocab_admin_all" ON vocabularies
    FOR ALL USING (is_admin());

-- ── ENROLLMENTS ──
CREATE POLICY "enrollments_user_select" ON enrollments
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "enrollments_user_insert" ON enrollments
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_admin_all" ON enrollments
    FOR ALL USING (is_admin());

-- ── USER_PROGRESS ──
CREATE POLICY "progress_user_all" ON user_progress
    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "progress_admin_select" ON user_progress
    FOR SELECT USING (is_admin());

-- ── USER_FAVORITES ──
CREATE POLICY "favorites_user_all" ON user_favorites
    FOR ALL USING (user_id = auth.uid());

-- ── ACTIVITY_LOGS ──
CREATE POLICY "logs_insert_all" ON activity_logs
    FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "logs_user_select" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "logs_admin_select" ON activity_logs
    FOR SELECT USING (is_admin());

-- ====================================================================
-- USEFUL RPC FUNCTIONS
-- ====================================================================

-- Get dashboard statistics (admin)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
        'totalCourses', (SELECT COUNT(*) FROM courses),
        'totalSections', (SELECT COUNT(*) FROM sections),
        'totalLessons', (SELECT COUNT(*) FROM lessons),
        'totalEnrollments', (SELECT COUNT(*) FROM enrollments WHERE status = 'active'),
        'activeUsers', (SELECT COUNT(DISTINCT user_id) FROM activity_logs WHERE created_at > NOW() - INTERVAL '30 days'),
        'newUsersThisWeek', (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days'),
        'newEnrollmentsThisWeek', (SELECT COUNT(*) FROM enrollments WHERE enrolled_at > NOW() - INTERVAL '7 days')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get published courses with section/lesson counts (public)
CREATE OR REPLACE FUNCTION get_published_courses()
RETURNS SETOF courses AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM courses
    WHERE status = 'published'
    ORDER BY order_index ASC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
