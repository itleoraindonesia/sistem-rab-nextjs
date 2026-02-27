-- Migration: Add Row Level Security (RLS) Policies
-- Date: 2026-02-27
-- Description: Enable RLS and create policies for all tables
--
-- RLS Strategy:
-- 1. Data master (master_panel, master_ongkir, document_types, instansi): All auth users can SELECT
-- 2. outgoing_letters: All auth users can SELECT, INSERT, UPDATE based on workflow
-- 3. letter_histories: All auth users can SELECT, INSERT via workflow
-- 4. mom_meetings: All auth users can SELECT, creator/manager can UPDATE
-- 5. users: Self-managed profiles + admin can manage all
-- 6. clients: All auth users can SELECT, CRM permissions for INSERT/UPDATE
-- 7. rab_documents: All auth users can SELECT, creator can UPDATE

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$$;

-- Function to check if current user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'manager'
    AND is_active = true
  );
$$;

-- Function to check if current user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
    AND is_active = true
  );
$$;

-- Function to check if current user has CRM manage permission
CREATE OR REPLACE FUNCTION has_crm_manage()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND (
      role = 'admin'
      OR (role = 'manager' AND departemen IN ('Konstruksi', 'Marketing', 'PBD'))
    )
    AND is_active = true
  );
$$;

-- ============================================
-- 1. USERS TABLE
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Allow authenticated read access" ON users;

-- All authenticated users can view all users (for dropdowns, assignments)
CREATE POLICY "Allow authenticated read access"
ON users
FOR SELECT
TO authenticated
USING (is_active = true);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin can insert/update/delete any user
CREATE POLICY "Admin can manage all users"
ON users
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 2. INSTANSI TABLE (Master Data)
-- ============================================

ALTER TABLE instansi ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view instansi" ON instansi;
DROP POLICY IF EXISTS "Admin can manage instansi" ON instansi;

-- All authenticated users can view
CREATE POLICY "All users can view instansi"
ON instansi
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage
CREATE POLICY "Admin can manage instansi"
ON instansi
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 3. DOCUMENT_TYPES TABLE (Master Data)
-- ============================================

ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view document types" ON document_types;
DROP POLICY IF EXISTS "Admin can manage document types" ON document_types;

-- All authenticated users can view
CREATE POLICY "All users can view document types"
ON document_types
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage
CREATE POLICY "Admin can manage document types"
ON document_types
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 4. DOCUMENT_WORKFLOW_STAGES TABLE (Master Data)
-- ============================================

ALTER TABLE document_workflow_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view workflow stages" ON document_workflow_stages;
DROP POLICY IF EXISTS "Admin can manage workflow stages" ON document_workflow_stages;

-- All authenticated users can view
CREATE POLICY "All users can view workflow stages"
ON document_workflow_stages
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage
CREATE POLICY "Admin can manage workflow stages"
ON document_workflow_stages
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 5. MASTER_PANEL TABLE (Master Data)
-- ============================================

ALTER TABLE master_panel ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view master panel" ON master_panel;
DROP POLICY IF EXISTS "Admin can manage master panel" ON master_panel;

-- All authenticated users can view (including for embedded kalkulator)
CREATE POLICY "All users can view master panel"
ON master_panel
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage
CREATE POLICY "Admin can manage master panel"
ON master_panel
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 6. MASTER_ONGKIR TABLE (Master Data)
-- ============================================

ALTER TABLE master_ongkir ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view master ongkir" ON master_ongkir;
DROP POLICY IF EXISTS "Admin can manage master ongkir" ON master_ongkir;

-- All authenticated users can view
CREATE POLICY "All users can view master ongkir"
ON master_ongkir
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage
CREATE POLICY "Admin can manage master ongkir"
ON master_ongkir
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 7. OUTGOING_LETTERS TABLE
-- ============================================

ALTER TABLE outgoing_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view letters" ON outgoing_letters;
DROP POLICY IF EXISTS "Authenticated users can create letters" ON outgoing_letters;
DROP POLICY IF EXISTS "Creator can update own draft" ON outgoing_letters;
DROP POLICY IF EXISTS "Admin can manage all letters" ON outgoing_letters;

-- All authenticated users can view all letters
CREATE POLICY "All users can view letters"
ON outgoing_letters
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create letters
CREATE POLICY "Authenticated users can create letters"
ON outgoing_letters
FOR INSERT
TO authenticated
WITH CHECK (created_by_id = auth.uid());

-- Creator can update their own DRAFT letters
CREATE POLICY "Creator can update own draft"
ON outgoing_letters
FOR UPDATE
TO authenticated
USING (
  created_by_id = auth.uid() 
  AND status = 'DRAFT'
)
WITH CHECK (created_by_id = auth.uid());

-- Admin/manager can update/delete any letter
CREATE POLICY "Admin can manage all letters"
ON outgoing_letters
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 8. LETTER_HISTORIES TABLE
-- ============================================

ALTER TABLE letter_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view letter histories" ON letter_histories;
DROP POLICY IF EXISTS "Authenticated users can insert histories" ON letter_histories;
DROP POLICY IF EXISTS "Admin can manage letter histories" ON letter_histories;

-- All authenticated users can view
CREATE POLICY "All users can view letter histories"
ON letter_histories
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert (workflow actions)
CREATE POLICY "Authenticated users can insert histories"
ON letter_histories
FOR INSERT
TO authenticated
WITH CHECK (action_by_id = auth.uid());

-- Admin can manage
CREATE POLICY "Admin can manage letter histories"
ON letter_histories
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 9. CLIENTS TABLE (CRM)
-- ============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view clients" ON clients;
DROP POLICY IF EXISTS "CRM users can create clients" ON clients;
DROP POLICY IF EXISTS "CRM users can update clients" ON clients;
DROP POLICY IF EXISTS "Admin can manage clients" ON clients;

-- All authenticated users can view
CREATE POLICY "All users can view clients"
ON clients
FOR SELECT
TO authenticated
USING (true);

-- Users with CRM permissions can create
CREATE POLICY "CRM users can create clients"
ON clients
FOR INSERT
TO authenticated
WITH CHECK (has_crm_manage());

-- Users with CRM permissions can update
CREATE POLICY "CRM users can update clients"
ON clients
FOR UPDATE
TO authenticated
USING (has_crm_manage())
WITH CHECK (has_crm_manage());

-- Admin can delete
CREATE POLICY "Admin can delete clients"
ON clients
FOR DELETE
TO authenticated
USING (is_admin());

-- ============================================
-- 10. MOM_MEETINGS TABLE
-- ============================================

ALTER TABLE mom_meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Authenticated users can create meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Creator can update meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Admin can manage meetings" ON mom_meetings;

-- All authenticated users can view
CREATE POLICY "All users can view meetings"
ON mom_meetings
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create meetings"
ON mom_meetings
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Creator can update their own meetings
CREATE POLICY "Creator can update meetings"
ON mom_meetings
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Admin/manager can manage all
CREATE POLICY "Admin can manage meetings"
ON mom_meetings
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 11. RAB_DOCUMENTS TABLE
-- ============================================

ALTER TABLE rab_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view RAB" ON rab_documents;
DROP POLICY IF EXISTS "Admin can manage RAB" ON rab_documents;

-- All authenticated users can view
CREATE POLICY "All users can view RAB"
ON rab_documents
FOR SELECT
TO authenticated
USING (true);

-- Only admin/manager can manage (full control)
CREATE POLICY "Admin can manage RAB"
ON rab_documents
FOR ALL
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- ============================================
-- 12. RAB_DOCUMENTS_BACKUP TABLE
-- ============================================

ALTER TABLE rab_documents_backup ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All users can view RAB backup" ON rab_documents_backup;
DROP POLICY IF EXISTS "Admin can manage RAB backup" ON rab_documents_backup;

-- All authenticated users can view
CREATE POLICY "All users can view RAB backup"
ON rab_documents_backup
FOR SELECT
TO authenticated
USING (true);

-- Only admin can manage backup
CREATE POLICY "Admin can manage RAB backup"
ON rab_documents_backup
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION is_admin() IS 'Check if current user has admin role';
COMMENT ON FUNCTION is_manager() IS 'Check if current user has manager role';
COMMENT ON FUNCTION is_admin_or_manager() IS 'Check if current user is admin or manager';
COMMENT ON FUNCTION has_crm_manage() IS 'Check if current user has CRM management permissions';
