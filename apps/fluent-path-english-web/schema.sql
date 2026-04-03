-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  thumbnail_url text,
  level text DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  status text DEFAULT 'draft',    -- 'draft', 'published', 'archived'
  order_index integer DEFAULT 0,
  price integer DEFAULT 0,
  original_price integer DEFAULT 0,
  enrolled_count integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Sections Table
CREATE TABLE IF NOT EXISTS public.sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  description text,
  order_index integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Lessons Table
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id uuid REFERENCES public.sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text,
  description text,
  lesson_type text DEFAULT 'listen', -- 'listen', 'slow', 'read', 'analysis', 'vocab', 'video', 'quiz', 'mixed'
  order_index integer DEFAULT 0,
  duration_seconds integer DEFAULT 0,
  is_free boolean DEFAULT false,
  is_published boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 4. Lesson Media Table (links audio, video, pdf)
CREATE TABLE IF NOT EXISTS public.lesson_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  media_type text DEFAULT 'audio', -- 'audio', 'video', 'pdf', 'image'
  title text,
  url text NOT NULL,                -- Cloudinary URL or Google Drive ID
  source_type text DEFAULT 'cloudinary', -- 'cloudinary', 'google_drive', 'youtube', 'external'
  order_index integer DEFAULT 0,
  file_size_bytes bigint,
  duration_seconds integer,
  mime_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Vocabularies Table
CREATE TABLE IF NOT EXISTS public.vocabularies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  word text NOT NULL,
  phonetic text,
  meaning_vi text,
  meaning_en text,
  example_sentence text,
  audio_url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Enrollments (User to Course mapping)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,  -- assuming using auth.users
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  status text DEFAULT 'active', -- 'active', 'completed', 'expired'
  enrolled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  expires_at timestamp with time zone
);

-- 7. User Progress (Lesson level)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  listen_count integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  progress_percent integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Example View: Custom users profile (if storing names, etc.)
-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
--   full_name text,
--   avatar_url text,
--   updated_at timestamp with time zone DEFAULT now()
-- );
