-- Migration: 029_rls_overhaul.sql
-- Feature: Role-Based RLS Rewrite
-- Purpose: Rewrite all RLS policies to use stakeholder_type + role permissions
-- Date: 2026-04-01
--
-- Strategy:
--   1. Drop all existing policies per table (shadow replacement)
--   2. Create new policies using helper functions from migrations 025-028
--   3. Internal users: access based on user_has_permission()
--   4. Vendors: only see data assigned to them
--   5. Clients: only see their own projects
--
-- IMPORTANT: This migration should be tested in staging before production.
--            If issues arise, rollback is: re-run migration 006_simplify_rls_auth_only.sql

-- ============================================================
-- HELPER: Optimized RLS functions using (select auth.uid()) pattern
-- ============================================================

-- Function: get current user's ID (cached pattern for RLS)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT (SELECT auth.uid())
$$;

COMMENT ON FUNCTION current_user_id() IS 'Cached auth.uid() for RLS policies. Prevents repeated calls.';

-- ============================================================
-- 1. USERS TABLE
-- Internal users: see all active users (for dropdowns, assignments)
-- Vendors/Clients: see nothing (no access to user list)
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users see all active users
CREATE POLICY "users_select"
ON users FOR SELECT
TO authenticated
USING (
  is_internal_user() AND is_active = true
);

-- UPDATE: Users can update own profile; admin can update any
CREATE POLICY "users_update_own"
ON users FOR UPDATE
TO authenticated
USING (id = current_user_id())
WITH CHECK (id = current_user_id());

CREATE POLICY "users_update_admin"
ON users FOR UPDATE
TO authenticated
USING (user_has_permission('users.manage'))
WITH CHECK (user_has_permission('users.manage'));

-- INSERT: Only users with manage permission
CREATE POLICY "users_insert"
ON users FOR INSERT
TO authenticated
WITH CHECK (user_has_permission('users.manage'));

-- DELETE: Only users with manage permission
CREATE POLICY "users_delete"
ON users FOR DELETE
TO authenticated
USING (user_has_permission('users.manage'));

-- ============================================================
-- 2. INSTANSI TABLE (Master Data)
-- Internal users with master.view permission
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'instansi' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.instansi', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "instansi_select"
ON instansi FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('master.view'));

CREATE POLICY "instansi_write"
ON instansi FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('master.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('master.manage'));

-- ============================================================
-- 3. DOCUMENT_TYPES TABLE (Master Data)
-- Internal users with master.view permission
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'document_types' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.document_types', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "document_types_select"
ON document_types FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('master.view'));

CREATE POLICY "document_types_write"
ON document_types FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('master.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('master.manage'));

-- ============================================================
-- 4. DOCUMENT_WORKFLOW_STAGES TABLE (Master Data)
-- Internal users with workflow.manage permission for write
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'document_workflow_stages' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.document_workflow_stages', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "workflow_stages_select"
ON document_workflow_stages FOR SELECT
TO authenticated
USING (is_internal_user());

CREATE POLICY "workflow_stages_write"
ON document_workflow_stages FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('workflow.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('workflow.manage'));

-- ============================================================
-- 5. MASTER_PANEL TABLE
-- Internal users with products.view permission
-- Keep anon access for embedded kalkulator
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'master_panel' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.master_panel', r.policyname);
  END LOOP;
END $$;

-- SELECT: Anon + authenticated (for embedded kalkulator)
CREATE POLICY "master_panel_select"
ON master_panel FOR SELECT
TO anon, authenticated
USING (true);

-- Write: Internal users with products.manage
CREATE POLICY "master_panel_write"
ON master_panel FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('products.edit'))
WITH CHECK (is_internal_user() AND user_has_permission('products.edit'));

-- ============================================================
-- 6. MASTER_ONGKIR TABLE
-- Same as master_panel
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'master_ongkir' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.master_ongkir', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "master_ongkir_select"
ON master_ongkir FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "master_ongkir_write"
ON master_ongkir FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('products.edit'))
WITH CHECK (is_internal_user() AND user_has_permission('products.edit'));

-- ============================================================
-- 7. OUTGOING_LETTERS TABLE
-- Internal users: view based on dokumen permissions
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'outgoing_letters' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.outgoing_letters', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users with any dokumen permission
CREATE POLICY "letters_select"
ON outgoing_letters FOR SELECT
TO authenticated
USING (
  is_internal_user() AND (
    user_has_permission('dokumen.create') OR
    user_has_permission('dokumen.create.own') OR
    user_has_permission('dokumen.review') OR
    user_has_permission('dokumen.approve') OR
    user_has_permission('users.manage')
  )
);

-- INSERT: Internal users with create permission
CREATE POLICY "letters_insert"
ON outgoing_letters FOR INSERT
TO authenticated
WITH CHECK (
  is_internal_user() AND (
    user_has_permission('dokumen.create') OR
    user_has_permission('dokumen.create.own')
  )
);

-- UPDATE: Creator can update own DRAFT; users with manage permission can update any
CREATE POLICY "letters_update_own_draft"
ON outgoing_letters FOR UPDATE
TO authenticated
USING (created_by_id = current_user_id() AND status = 'DRAFT')
WITH CHECK (created_by_id = current_user_id());

CREATE POLICY "letters_update_manage"
ON outgoing_letters FOR UPDATE
TO authenticated
USING (is_internal_user() AND user_has_permission('users.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('users.manage'));

-- DELETE: Creator can delete own DRAFT; users with manage permission
CREATE POLICY "letters_delete_own_draft"
ON outgoing_letters FOR DELETE
TO authenticated
USING (created_by_id = current_user_id() AND status = 'DRAFT');

CREATE POLICY "letters_delete_manage"
ON outgoing_letters FOR DELETE
TO authenticated
USING (is_internal_user() AND user_has_permission('users.manage'));

-- ============================================================
-- 8. LETTER_HISTORIES TABLE
-- Internal users: view all; insert via workflow actions
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'letter_histories' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.letter_histories', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users with any dokumen permission
CREATE POLICY "letter_histories_select"
ON letter_histories FOR SELECT
TO authenticated
USING (
  is_internal_user() AND (
    user_has_permission('dokumen.create') OR
    user_has_permission('dokumen.create.own') OR
    user_has_permission('dokumen.review') OR
    user_has_permission('dokumen.approve') OR
    user_has_permission('users.manage')
  )
);

-- INSERT: Internal users (workflow actions via RPC)
CREATE POLICY "letter_histories_insert"
ON letter_histories FOR INSERT
TO authenticated
WITH CHECK (
  is_internal_user() AND (
    user_has_permission('dokumen.create') OR
    user_has_permission('dokumen.create.own') OR
    user_has_permission('dokumen.review') OR
    user_has_permission('dokumen.approve')
  )
);

-- ============================================================
-- 9. CLIENTS TABLE (CRM)
-- Internal users with crm permissions
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clients', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "clients_select"
ON clients FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('crm.view'));

CREATE POLICY "clients_insert"
ON clients FOR INSERT
TO authenticated
WITH CHECK (is_internal_user() AND user_has_permission('crm.create'));

CREATE POLICY "clients_update"
ON clients FOR UPDATE
TO authenticated
USING (is_internal_user() AND user_has_permission('crm.edit'))
WITH CHECK (is_internal_user() AND user_has_permission('crm.edit'));

CREATE POLICY "clients_delete"
ON clients FOR DELETE
TO authenticated
USING (is_internal_user() AND user_has_permission('users.manage'));

-- ============================================================
-- 10. MOM_MEETINGS TABLE
-- Internal users with meeting permissions
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'mom_meetings' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.mom_meetings', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "meetings_select"
ON mom_meetings FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('meeting.view'));

CREATE POLICY "meetings_insert"
ON mom_meetings FOR INSERT
TO authenticated
WITH CHECK (is_internal_user() AND user_has_permission('meeting.view'));

CREATE POLICY "meetings_update_own"
ON mom_meetings FOR UPDATE
TO authenticated
USING (created_by = current_user_id())
WITH CHECK (created_by = current_user_id());

CREATE POLICY "meetings_update_manage"
ON mom_meetings FOR UPDATE
TO authenticated
USING (is_internal_user() AND user_has_permission('meeting.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('meeting.manage'));

CREATE POLICY "meetings_delete"
ON mom_meetings FOR DELETE
TO authenticated
USING (is_internal_user() AND user_has_permission('meeting.manage'));

-- ============================================================
-- 11. RAB_DOCUMENTS TABLE
-- Internal users with products permissions
-- Vendors/Clients: no access
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'rab_documents' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rab_documents', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "rab_select"
ON rab_documents FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('products.view'));

CREATE POLICY "rab_write"
ON rab_documents FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('products.create'))
WITH CHECK (is_internal_user() AND user_has_permission('products.create'));

-- ============================================================
-- 12. RAB_DOCUMENTS_BACKUP TABLE
-- Internal users with admin/manager permission
-- ============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'rab_documents_backup' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rab_documents_backup', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "rab_backup_select"
ON rab_documents_backup FOR SELECT
TO authenticated
USING (is_internal_user() AND user_has_permission('products.view'));

CREATE POLICY "rab_backup_write"
ON rab_documents_backup FOR ALL
TO authenticated
USING (is_internal_user() AND user_has_permission('users.manage'))
WITH CHECK (is_internal_user() AND user_has_permission('users.manage'));

-- ============================================================
-- NOTES: vendor_spk, vendor_progress, vendor_payment, customer_payment
-- RLS sudah di-handle di migration 027_vendor_integration.sql
-- ============================================================

-- ============================================================
-- NOTES: projects RLS sudah di-handle di migration 028_client_integration.sql
-- ============================================================
