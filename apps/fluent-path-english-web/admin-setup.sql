-- 1. Tạo bảng profiles nếu chưa có
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text DEFAULT 'user',
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tự động đồng bộ các user đã đăng ký trên hệ thống vào bảng profiles
-- và set role của họ thành 'admin' để bạn có thể vào màn admin
INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin' 
FROM auth.users
ON CONFLICT (id) DO UPDATE 
SET role = 'admin';
