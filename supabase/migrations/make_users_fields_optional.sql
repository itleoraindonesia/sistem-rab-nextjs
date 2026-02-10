-- ============================================
-- MAKE USERS TABLE FIELDS OPTIONAL
-- ============================================
-- This migration makes nama, username, and nik nullable
-- so users can be created via auth first, then data filled in later
-- ============================================

-- Step 1: Drop unique constraints temporarily
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_nik_key;

-- Step 2: Make fields nullable
ALTER TABLE public.users ALTER COLUMN nama DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN nik DROP NOT NULL;

-- Step 3: Recreate unique constraints but allow NULL values
-- PostgreSQL unique constraints allow multiple NULLs by default
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON public.users(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_nik_key ON public.users(nik) WHERE nik IS NOT NULL;

-- Step 4: Add check constraint to ensure email is always present
ALTER TABLE public.users ADD CONSTRAINT users_email_not_null CHECK (email IS NOT NULL);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name IN ('email', 'nama', 'username', 'nik')
ORDER BY ordinal_position;

-- Check constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'public.users'::regclass
  AND conname LIKE '%username%' OR conname LIKE '%nik%' OR conname LIKE '%email%';

-- ============================================
-- USAGE NOTES
-- ============================================
-- After this migration:
-- 1. Users can be created with just email and id
-- 2. nama, username, nik can be NULL initially
-- 3. Data can be filled in later via UPDATE
-- 4. username and nik are still unique when not NULL
-- ============================================
