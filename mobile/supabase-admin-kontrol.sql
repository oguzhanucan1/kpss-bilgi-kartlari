-- Admin giriş sorununu kontrol etmek için
-- Supabase Dashboard → SQL Editor'da çalıştırın.

-- 1) Bu e-posta auth.users'da var mı?
SELECT id, email, created_at
FROM auth.users
WHERE email = 'oguzhanucan01@gmail.com';

-- 2) profiles'da bu kullanıcı var mı, role ne?
SELECT p.id, p.role
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'oguzhanucan01@gmail.com';

-- 3) profiles tablosunda "role" sütunu var mı?
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;
