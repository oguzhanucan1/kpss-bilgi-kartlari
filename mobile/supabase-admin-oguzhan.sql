-- oguzhanucan01@gmail.com hesabına admin yetkisi ver
-- Supabase Dashboard → SQL Editor'da çalıştırın.

UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'oguzhanucan01@gmail.com'
  LIMIT 1
);

-- Kaç satır güncellendi kontrol (0 = kullanıcı veya profiles kaydı yok)
-- Aşağıyı çalıştırırsanız sonucu görürsünüz:
-- SELECT * FROM public.profiles p JOIN auth.users u ON u.id = p.id WHERE u.email = 'oguzhanucan01@gmail.com';
