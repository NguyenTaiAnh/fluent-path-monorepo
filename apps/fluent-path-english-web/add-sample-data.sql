-- Thêm dữ liệu mẫu cho courses
-- Chạy trong Supabase Dashboard → SQL Editor

-- 1. Thêm courses mẫu
INSERT INTO courses (title, description, level, status, enrolled_users) 
VALUES 
('English for Beginners', 'Basic English course for beginners', 'Beginner', 'published', 0),
('Business English', 'Professional English for business', 'Intermediate', 'published', 0),
('IELTS Preparation', 'Complete IELTS preparation course', 'Advanced', 'published', 0);

-- 2. Thêm sections cho mỗi course
INSERT INTO sections (course_id, title, order_index)
SELECT 
    id, 'Introduction to English', 0
FROM courses 
WHERE title = 'English for Beginners';

INSERT INTO sections (course_id, title, order_index)
SELECT 
    id, 'Business Communication', 0
FROM courses 
WHERE title = 'Business English';

INSERT INTO sections (course_id, title, order_index)
SELECT 
    id, 'IELTS Speaking', 0
FROM courses 
WHERE title = 'IELTS Preparation';

-- 3. Thêm lessons cho mỗi section
-- Lessons cho English for Beginners
INSERT INTO lessons (section_id, title, lesson_type, content_url, order_index)
SELECT 
    s.id, 'Basic Greetings', 'listen', 'https://example.com/audio1.mp3', 0
FROM sections s
WHERE s.title = 'Introduction to English';

INSERT INTO lessons (section_id, title, lesson_type, content_url, order_index)
SELECT 
    s.id, 'Alphabet Review', 'read', 'https://example.com/doc1.pdf', 1
FROM sections s
WHERE s.title = 'Introduction to English';

INSERT INTO lessons (section_id, title, lesson_type, content_url, order_index)
SELECT 
    s.id, 'Common Words', 'vocab', NULL, 2
FROM sections s
WHERE s.title = 'Introduction to English';

-- Kiểm tra kết quả
SELECT 
    c.title as course_title,
    s.title as section_title,
    l.title as lesson_title,
    l.lesson_type,
    l.content_url
FROM courses c
JOIN sections s ON c.id = s.course_id
JOIN lessons l ON s.id = l.section_id
WHERE c.status = 'published'
ORDER BY c.created_at DESC, s.order_index, l.order_index;
