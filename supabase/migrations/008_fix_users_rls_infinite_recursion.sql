-- Migration: Fix infinite recursion in users RLS policy
-- Date: 2026-02-27
-- Issue: "infinite recursion detected in policy for relation 'users'"
--        Terjadi karena ada policy pada tabel users yang memanggil fungsi
--        (is_admin, is_manager, dll) yang query balik ke tabel users.
--
-- Fix:
--   1. Drop SEMUA policy yang ada di tabel users (bersih total)
--   2. Drop fungsi-fungsi yang bisa menyebabkan recursion (jika masih ada)
--   3. Buat ulang policy yang TIDAK recursive (hanya pakai auth.uid())

-- ============================================================================
-- STEP 1: Drop semua policy pada tabel users (nuclear clean)
-- ============================================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'users' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- ============================================================================
-- STEP 2: Drop fungsi-fungsi yang menyebabkan recursion (jika masih ada)
-- Fungsi ini query ke tabel users dan jika dipakai di policy users = recursion
-- ============================================================================

DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_manager() CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_manager() CASCADE;
DROP FUNCTION IF EXISTS has_crm_manage() CASCADE;

-- ============================================================================
-- STEP 3: Buat ulang policy users yang AMAN (tanpa query ke users table)
-- ============================================================================

-- SELECT: Semua authenticated user bisa lihat user aktif (untuk dropdown, dsb)
-- PENTING: TIDAK boleh ada subquery ke tabel users di sini!
CREATE POLICY "users_select_authenticated"
ON users
FOR SELECT
TO authenticated
USING (is_active = true);

-- UPDATE: Hanya bisa update profil sendiri
CREATE POLICY "users_update_own_profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- INSERT/DELETE: Tidak ada policy → default DENY untuk semua user biasa
-- Gunakan service_role key dari backend/Supabase dashboard untuk manage users

-- ============================================================================
-- STEP 4: Bersihkan juga policy lain yang mungkin masih pakai is_admin, dll
-- dan rebuild policy mereka tanpa fungsi recursive
-- ============================================================================

-- Instansi
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'instansi' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.instansi', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "instansi_select_auth" ON instansi FOR SELECT TO authenticated USING (true);
CREATE POLICY "instansi_write_auth" ON instansi FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Document types
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'document_types' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.document_types', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "doc_types_select_auth" ON document_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "doc_types_write_auth" ON document_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Document workflow stages
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'document_workflow_stages' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.document_workflow_stages', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "workflow_stages_select_auth" ON document_workflow_stages FOR SELECT TO authenticated USING (true);
CREATE POLICY "workflow_stages_write_auth" ON document_workflow_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- VERIFY: Cek policy yang aktif sekarang di tabel users
-- ============================================================================
-- Jalankan ini setelah migration untuk konfirmasi:
/*
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
*/
