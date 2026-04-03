# Setup Guide: Supabase Authentication & Admin System

## 1. Chạy Migrations

```bash
# Chạy migration mới nhất
supabase db push

# Hoặc nếu muốn reset và chạy lại
supabase db reset
```

## 2. Tạo Admin User

### Cách 1: Via SQL
```sql
-- Trong Supabase Dashboard → SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### Cách 2: Via Supabase Dashboard
1. Vào **Authentication** → **Users**
2. Tìm user muốn làm admin
3. Click vào user → **View profile**
4. Sửa role thành 'admin'

### Cách 3: Seeding data
```sql
-- Add to migration file
INSERT INTO profiles (id, role, full_name)
SELECT 
    id,
    'admin',
    'System Administrator'
FROM auth.users 
WHERE email = 'admin@example.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.users.id
);
```

## 3. Kiểm tra Trigger

Trong Supabase Dashboard:
1. **Database** → **Triggers**
2. Tìm trigger `on_auth_user_created`
3. Kiểm tra function `handle_new_user()`

## 4. Test Flow

### Test User Registration:
1. Đăng ký user mới
2. Check trong `profiles` table
3. Verify `role = 'user'` được gán tự động

### Test Admin Access:
1. Login với admin user
2. Truy cập `/admin`
3. Should work ✅

### Test Regular User:
1. Login với regular user  
2. Truy cập `/admin`
3. Should redirect to `/unauthorized` ✅

## 5. Environment Variables

Đảm bảo có trong `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 6. TypeScript Types

Generate types mới:
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## 7. Common Issues & Solutions

### Issue: "User not found in profiles"
**Solution:** Trigger chưa chạy → Check trigger settings

### Issue: "Admin access denied"  
**Solution:** Role chưa đúng → Check profiles table

### Issue: "Migration failed"
**Solution:** Rollback và chạy lại:
```bash
supabase db reset
supabase db push
```

## 8. Verification Commands

```sql
-- Check profiles table
SELECT * FROM profiles;

-- Check admin users
SELECT * FROM profiles WHERE role = 'admin';

-- Check trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## 9. Production Deployment

```bash
# Push migrations to production
supabase db push --remote production

# Hoặc specific migration
supabase migration up --remote production
```

## 10. Monitoring

- Check **Supabase Dashboard** → **Logs** cho authentication errors
- Monitor **Database** → **Performance** cho slow queries
- Track **Authentication** → **Users** cho signups
