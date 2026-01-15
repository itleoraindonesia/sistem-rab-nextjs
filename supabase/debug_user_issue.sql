-- ============================================
-- DEBUG: Check if tables exist and user data
-- ============================================

-- 1. Check if users table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'users'
);

-- 2. Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'alv@gmail.com';

-- 3. Check if user exists in public.users
SELECT * 
FROM public.users 
WHERE email = 'alv@gmail.com';

-- 4. Check RLS policies on users table
SELECT * 
FROM pg_policies 
WHERE tablename = 'users';

-- ============================================
-- FIX: If user doesn't exist in public.users
-- ============================================

-- Get the auth user ID first
SELECT id FROM auth.users WHERE email = 'alv@gmail.com';

-- Then manually insert the user profile
-- Replace 'USER_UUID_HERE' with the actual UUID from above query
INSERT INTO public.users (
  id,
  nik,
  username,
  email,
  nama,
  jabatan,
  departemen,
  no_hp,
  instansi_id,
  role,
  is_active
) VALUES (
  'USER_UUID_HERE', -- Replace with actual UUID
  'MMGT-25-BDV-030',
  'alvin',
  'alv@gmail.com',
  'Alvin Al Munawwar',
  'Web Developer',
  'PBD',
  '6285855858',
  (SELECT id FROM public.instansi WHERE nama = 'PT Maju Mandiri Gemilang Terang' LIMIT 1),
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  nik = EXCLUDED.nik,
  username = EXCLUDED.username,
  nama = EXCLUDED.nama,
  jabatan = EXCLUDED.jabatan,
  departemen = EXCLUDED.departemen,
  no_hp = EXCLUDED.no_hp,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- ============================================
-- FIX: Temporarily disable RLS for testing
-- ============================================

-- ONLY FOR TESTING - Re-enable after fixing!
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- After testing, re-enable:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
