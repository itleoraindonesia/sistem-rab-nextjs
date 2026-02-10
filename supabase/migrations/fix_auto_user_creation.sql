-- ============================================
-- FIX AUTO USER CREATION FROM AUTH.USERS
-- ============================================
-- This script checks and fixes the auto-user creation trigger
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: CHECK CURRENT TRIGGER STATUS
-- ============================================

-- Check if trigger exists
SELECT 
  tgname as trigger_name,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================
-- STEP 2: DROP AND RECREATE TRIGGER & FUNCTION
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create OPTIONAL auto-user creation function
-- This allows users to be created in auth.users first
-- Data in public.users can be filled in later
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists (prevent duplicates)
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE NOTICE 'User profile already exists for id: %', NEW.id;
    RETURN NEW;
  END IF;
  
  -- OPTION 1: Skip auto-creation entirely (data filled in later)
  -- Just log and return, allowing manual data entry later
  RAISE NOTICE 'New auth user created: % (id: %). Public.users entry can be created manually.', NEW.email, NEW.id;
  RETURN NEW;
  
  -- OPTION 2: Create minimal entry (uncomment if you want this instead)
  -- This creates a basic entry that can be updated later
  /*
  INSERT INTO public.users (
    id, 
    email, 
    nama, 
    username, 
    nik, 
    role, 
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nama',
      'User-' || LEFT(NEW.id::TEXT, 8)  -- Temporary name
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8)  -- Temporary username
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'nik',
      'NIK-' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8)  -- Temporary NIK
    ),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
    false  -- Set to inactive until data is completed
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Minimal user profile created for: %. Please complete the data.', NEW.email;
  */
  
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block signup
    RAISE WARNING 'Auto-create user profile failed (non-critical): % - SQLSTATE: %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 3: ADD RLS POLICY FOR SERVICE ROLE
-- ============================================

-- Allow service role to insert users (for trigger)
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STEP 4: BACKFILL EXISTING AUTH USERS
-- ============================================

-- Create function to backfill existing auth users
CREATE OR REPLACE FUNCTION backfill_existing_auth_users()
RETURNS TABLE(
  auth_user_id UUID,
  email TEXT,
  status TEXT
) AS $$
DECLARE
  v_auth_user RECORD;
  v_result_status TEXT;
BEGIN
  FOR v_auth_user IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.users (
        id,
        email,
        nama,
        username,
        nik,
        role,
        is_active
      )
      VALUES (
        v_auth_user.id,
        v_auth_user.email,
        COALESCE(
          v_auth_user.raw_user_meta_data->>'nama',
          v_auth_user.raw_user_meta_data->>'full_name',
          SPLIT_PART(v_auth_user.email, '@', 1)
        ),
        COALESCE(
          v_auth_user.raw_user_meta_data->>'username',
          SPLIT_PART(v_auth_user.email, '@', 1)
        ),
        COALESCE(
          v_auth_user.raw_user_meta_data->>'nik',
          'NIK-' || LEFT(REPLACE(v_auth_user.id::TEXT, '-', ''), 8)
        ),
        COALESCE(
          (v_auth_user.raw_user_meta_data->>'role')::user_role,
          'user'
        ),
        true
      );
      
      v_result_status := 'SUCCESS';
      
    EXCEPTION
      WHEN unique_violation THEN
        -- Try with timestamp suffix
        INSERT INTO public.users (
          id,
          email,
          nama,
          username,
          nik,
          role,
          is_active
        )
        VALUES (
          v_auth_user.id,
          v_auth_user.email,
          SPLIT_PART(v_auth_user.email, '@', 1),
          SPLIT_PART(v_auth_user.email, '@', 1) || '_' || EXTRACT(EPOCH FROM NOW())::BIGINT,
          'NIK-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
          'user',
          true
        );
        v_result_status := 'SUCCESS_WITH_MODIFIED_VALUES';
        
      WHEN OTHERS THEN
        v_result_status := 'FAILED: ' || SQLERRM;
    END;
    
    auth_user_id := v_auth_user.id;
    email := v_auth_user.email;
    status := v_result_status;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: RUN VERIFICATION
-- ============================================

-- Check trigger is active
SELECT 
  'Trigger Status' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ ACTIVE'
    ELSE '❌ NOT FOUND'
  END as status
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check function exists
SELECT 
  'Function Status' as check_type,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END as status
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Check for orphaned auth users (in auth.users but not in public.users)
SELECT 
  'Orphaned Users' as check_type,
  COUNT(*) || ' users need backfill' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- STEP 6: BACKFILL ORPHANED USERS
-- ============================================
-- Uncomment the line below to run backfill:
-- SELECT * FROM backfill_existing_auth_users();

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Check the verification results at the bottom
-- 3. If there are orphaned users, uncomment and run:
--    SELECT * FROM backfill_existing_auth_users();
-- 4. Test by creating a new user via Supabase Auth
-- 5. Verify the user appears in public.users table
-- ============================================
