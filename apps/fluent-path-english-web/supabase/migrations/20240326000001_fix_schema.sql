-- Migration: Fix schema issues
-- 1. Rename 'progress' table to 'user_progress' for clarity
ALTER TABLE IF EXISTS progress RENAME TO user_progress;

-- 2. Fix broken RLS policy on courses (references 'role' column that doesn't exist on courses table)
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "Admins can manage all courses" ON courses
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles
            WHERE role = 'admin'
        )
    );

-- 3. Add avatar_url column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 4. Ensure consistent order_index naming (rename 'order' if it exists as alias)
-- The migration already uses order_index, so this is a safety check
DO $$
BEGIN
    -- Check if sections has 'order' column and rename to order_index
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sections' AND column_name = 'order'
    ) THEN
        ALTER TABLE sections RENAME COLUMN "order" TO order_index;
    END IF;

    -- Check if lessons has 'order' column and rename to order_index
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lessons' AND column_name = 'order'
    ) THEN
        ALTER TABLE lessons RENAME COLUMN "order" TO order_index;
    END IF;
END $$;

-- 5. Update indexes for renamed table
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);

-- 6. Re-create RLS policies on user_progress (old ones reference 'progress' table name)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress" ON user_progress;
CREATE POLICY "Users can manage own progress" ON user_progress
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all progress" ON user_progress;
CREATE POLICY "Admins can view all progress" ON user_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Re-create trigger for updated_at on user_progress
DROP TRIGGER IF EXISTS update_progress_updated_at ON user_progress;
