-- ============================================
-- CREATE FIRST ADMIN USER
-- ============================================
-- User: Alvin Al Munawwar
-- Email: alv@gmail.com
-- Role: admin
-- ============================================

-- Step 1: Create auth user via Supabase Dashboard
-- Go to Authentication → Users → Add User
-- Email: alv@gmail.com
-- Password: [Set your password]
-- Auto Confirm User: Yes

-- Step 2: After creating the auth user, run this SQL to update the profile
-- Replace 'USER_UUID_HERE' with the actual UUID from auth.users

-- Get the user ID first (run this to find the UUID)
SELECT id, email FROM auth.users WHERE email = 'alv@gmail.com';

-- Then update the user profile with the UUID
UPDATE public.users
SET 
  nik = 'MMGT-25-BDV-030',
  username = 'alvin',
  nama = 'Alvin Al Munawwar',
  jabatan = 'Web Developer',
  departemen = 'PBD',
  no_hp = '6285855858',
  email = 'alv@gmail.com',
  role = 'admin',
  is_active = true,
  instansi_id = (SELECT id FROM public.instansi WHERE nama = 'PT Maju Mandiri Gemilang Terang' LIMIT 1)
WHERE id = (SELECT id FROM auth.users WHERE email = 'alv@gmail.com');

-- Verify the user was created correctly
SELECT 
  u.id,
  u.nik,
  u.username,
  u.nama,
  u.jabatan,
  u.departemen,
  u.no_hp,
  u.email,
  u.role,
  u.is_active,
  i.nama as instansi
FROM public.users u
LEFT JOIN public.instansi i ON u.instansi_id = i.id
WHERE u.email = 'alv@gmail.com';

-- ============================================
-- ALTERNATIVE: Manual Insert (if trigger didn't work)
-- ============================================
-- Only use this if the profile wasn't auto-created

/*
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
  (SELECT id FROM auth.users WHERE email = 'alv@gmail.com'),
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
);
*/
