-- ============================================
-- CREATE TEST USERS FOR LETTER WORKFLOW
-- ============================================
-- Purpose: Create test users for letter workflow testing
-- Users: 2 Reviewers + 1 Approver
-- Password: password123 (for all test users)
-- ============================================

-- ============================================
-- STEP 1: Create Auth Users
-- ============================================
-- Note: These will be created in auth.users table
-- Run via Supabase Dashboard or use supabase auth CLI

-- After creating auth users, get their UUIDs and use them below
-- For now, we'll use placeholder UUIDs - replace with actual ones

-- Reviewer 1
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'reviewer1@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"role":"reviewer"}',
  NOW(),
  NOW()
);

-- Reviewer 2
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'reviewer2@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"role":"reviewer"}',
  NOW(),
  NOW()
);

-- Approver 1
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'approver@test.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  '{"role":"approver"}',
  NOW(),
  NOW()
);

-- ============================================
-- STEP 2: Create Public User Profiles
-- ============================================

-- Get MMG Instansi ID
DECLARE
  v_instansi_id TEXT;
BEGIN
  SELECT id INTO v_instansi_id
  FROM public.instansi
  WHERE nama = 'PT Maju Mandiri Gemilang Terang'
  LIMIT 1;
  
  -- If MMG doesn't exist, create it
  IF v_instansi_id IS NULL THEN
    INSERT INTO public.instansi (id, nama, alamat, email, telepon, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'PT Maju Mandiri Gemilang Terang',
      'Jl. Test Address No. 123',
      'test@mmgt.co.id',
      '+628123456789',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_instansi_id;
  END IF;
  
  -- Reviewer 1 Profile
  INSERT INTO public.users (
    id,
    username,
    email,
    nama,
    nik,
    jabatan,
    departemen,
    no_hp,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'reviewer1',
    'reviewer1@test.com',
    'Reviewer One',
    'MMGT-25-REV-001',
    'Reviewer',
    'Sales & Marketing',
    '6281234567801',
    'reviewer',
    true,
    NOW(),
    NOW()
  );
  
  -- Reviewer 2 Profile
  INSERT INTO public.users (
    id,
    username,
    email,
    nama,
    nik,
    jabatan,
    departemen,
    no_hp,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'reviewer2',
    'reviewer2@test.com',
    'Reviewer Two',
    'MMGT-25-REV-002',
    'Reviewer',
    'Legal & Contract',
    '6281234567802',
    'reviewer',
    true,
    NOW(),
    NOW()
  );
  
  -- Approver 1 Profile
  INSERT INTO public.users (
    id,
    username,
    email,
    nama,
    nik,
    jabatan,
    departemen,
    no_hp,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'approver',
    'approver@test.com',
    'Approver One',
    'MMGT-25-APP-001',
    'Approver',
    'Management',
    '6281234567803',
    'approver',
    true,
    NOW(),
    NOW()
  );
END;

-- ============================================
-- STEP 3: Verify Users Created
-- ============================================

SELECT 
  u.id,
  u.username,
  u.email,
  u.nama,
  u.jabatan,
  u.departemen,
  u.role,
  'test user' as type
FROM public.users u
WHERE u.email IN (
  'reviewer1@test.com',
  'reviewer2@test.com',
  'approver@test.com'
)
ORDER BY u.role;

-- ============================================
-- NOTES
-- ============================================
-- 1. Password for all test users: password123
-- 2. Log in at: /login
-- 3. Reviewer emails: reviewer1@test.com, reviewer2@test.com
-- 4. Approver email: approver@test.com
-- 5. These users will be used in workflow_configs migration
-- ============================================