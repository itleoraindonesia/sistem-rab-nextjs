-- Migration: Simplify RLS to Auth-Only
-- Date: 2026-02-27
-- Description: Menyederhanakan RLS dari RBAC menjadi auth-only.
--              RBAC (role-based access) dipindahkan ke level frontend/menu.
--
-- Strategi baru:
--   A. Auth-only  → Semua tabel: cukup login untuk SELECT & write
--   B. Ownership  → Tetap cek created_by/action_by untuk data integrity (BUKAN RBAC)
--   C. Embed/Anon → master_panel & master_ongkir dibuka ke anon untuk kalkulator embed
--
-- Helper functions (is_admin, is_manager, dll) di-drop karena tidak dipakai lagi.
-- ============================================

-- ============================================
-- CLEANUP: Drop helper functions lama (tidak dipakai lagi)
-- ============================================

-- CASCADE otomatis drop semua policy lama yang bergantung pada function-function ini
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS is_manager() CASCADE;
DROP FUNCTION IF EXISTS is_admin_or_manager() CASCADE;
DROP FUNCTION IF EXISTS has_crm_manage() CASCADE;

-- ============================================
-- 1. USERS TABLE
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow authenticated read access" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- SELECT: Semua authenticated user bisa lihat (untuk dropdown, assignment)
CREATE POLICY "auth_users_select"
ON users
FOR SELECT
TO authenticated
USING (is_active = true);

-- UPDATE: User hanya bisa update profil sendiri
CREATE POLICY "auth_users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- INSERT/DELETE: Hanya bisa via server/admin (tidak ada policy → default deny)
-- Gunakan service_role key dari backend untuk insert/delete user

-- ============================================
-- 2. INSTANSI TABLE (Master Data)
-- ============================================

DROP POLICY IF EXISTS "All users can view instansi" ON instansi;
DROP POLICY IF EXISTS "Admin can manage instansi" ON instansi;

-- SELECT & write: Semua authenticated user
CREATE POLICY "auth_instansi_select"
ON instansi
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_instansi_write"
ON instansi
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. DOCUMENT_TYPES TABLE (Master Data)
-- ============================================

DROP POLICY IF EXISTS "All users can view document types" ON document_types;
DROP POLICY IF EXISTS "Admin can manage document types" ON document_types;

CREATE POLICY "auth_document_types_select"
ON document_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_document_types_write"
ON document_types
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. DOCUMENT_WORKFLOW_STAGES TABLE (Master Data)
-- ============================================

DROP POLICY IF EXISTS "All users can view workflow stages" ON document_workflow_stages;
DROP POLICY IF EXISTS "Admin can manage workflow stages" ON document_workflow_stages;

CREATE POLICY "auth_workflow_stages_select"
ON document_workflow_stages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_workflow_stages_write"
ON document_workflow_stages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. MASTER_PANEL TABLE
-- Dibuka ke anon untuk kalkulator embed (diakses tanpa login)
-- ============================================

DROP POLICY IF EXISTS "All users can view master panel" ON master_panel;
DROP POLICY IF EXISTS "Admin can manage master panel" ON master_panel;

-- SELECT: Boleh diakses tanpa login (untuk embed kalkulator)
CREATE POLICY "public_master_panel_select"
ON master_panel
FOR SELECT
TO anon, authenticated
USING (true);

-- Write: Hanya authenticated user
CREATE POLICY "auth_master_panel_write"
ON master_panel
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. MASTER_ONGKIR TABLE
-- Dibuka ke anon untuk kalkulator embed (diakses tanpa login)
-- ============================================

DROP POLICY IF EXISTS "All users can view master ongkir" ON master_ongkir;
DROP POLICY IF EXISTS "Admin can manage master ongkir" ON master_ongkir;

-- SELECT: Boleh diakses tanpa login (untuk embed kalkulator)
CREATE POLICY "public_master_ongkir_select"
ON master_ongkir
FOR SELECT
TO anon, authenticated
USING (true);

-- Write: Hanya authenticated user
CREATE POLICY "auth_master_ongkir_write"
ON master_ongkir
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. OUTGOING_LETTERS TABLE
-- Ownership check tetap ada untuk data integrity (bukan RBAC)
-- ============================================

DROP POLICY IF EXISTS "All users can view letters" ON outgoing_letters;
DROP POLICY IF EXISTS "Authenticated users can create letters" ON outgoing_letters;
DROP POLICY IF EXISTS "Creator can update own draft" ON outgoing_letters;
DROP POLICY IF EXISTS "Admin can manage all letters" ON outgoing_letters;

-- SELECT: Semua authenticated user bisa lihat semua surat
CREATE POLICY "auth_letters_select"
ON outgoing_letters
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Cek ownership (created_by_id harus milik user yang login)
CREATE POLICY "auth_letters_insert"
ON outgoing_letters
FOR INSERT
TO authenticated
WITH CHECK (created_by_id = auth.uid());

-- UPDATE: Creator bisa update surat miliknya yang masih DRAFT
--         Workflow status change (submit, review, approve) dilakukan via RPC SECURITY DEFINER
CREATE POLICY "auth_letters_update_own_draft"
ON outgoing_letters
FOR UPDATE
TO authenticated
USING (created_by_id = auth.uid() AND status = 'DRAFT')
WITH CHECK (created_by_id = auth.uid());

-- DELETE: Creator bisa hapus surat miliknya yang masih DRAFT
CREATE POLICY "auth_letters_delete_own_draft"
ON outgoing_letters
FOR DELETE
TO authenticated
USING (created_by_id = auth.uid() AND status = 'DRAFT');

-- ============================================
-- 8. LETTER_HISTORIES TABLE
-- Ownership check tetap ada untuk data integrity
-- ============================================

DROP POLICY IF EXISTS "All users can view letter histories" ON letter_histories;
DROP POLICY IF EXISTS "Authenticated users can insert histories" ON letter_histories;
DROP POLICY IF EXISTS "Admin can manage letter histories" ON letter_histories;

-- SELECT: Semua authenticated user bisa lihat semua history
CREATE POLICY "auth_letter_histories_select"
ON letter_histories
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Cek ownership (action_by_id harus milik user yang login)
--         Workflow actions via RPC tidak terkena policy ini (SECURITY DEFINER)
CREATE POLICY "auth_letter_histories_insert"
ON letter_histories
FOR INSERT
TO authenticated
WITH CHECK (action_by_id = auth.uid());

-- ============================================
-- 9. CLIENTS TABLE (CRM)
-- ============================================

DROP POLICY IF EXISTS "All users can view clients" ON clients;
DROP POLICY IF EXISTS "CRM users can create clients" ON clients;
DROP POLICY IF EXISTS "CRM users can update clients" ON clients;
DROP POLICY IF EXISTS "Admin can delete clients" ON clients;

-- Semua operasi: authenticated user
CREATE POLICY "auth_clients_select"
ON clients
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_clients_write"
ON clients
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 10. MOM_MEETINGS TABLE
-- ============================================

DROP POLICY IF EXISTS "All users can view meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Authenticated users can create meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Creator can update meetings" ON mom_meetings;
DROP POLICY IF EXISTS "Admin can manage meetings" ON mom_meetings;

CREATE POLICY "auth_meetings_select"
ON mom_meetings
FOR SELECT
TO authenticated
USING (true);

-- INSERT: Ownership check
CREATE POLICY "auth_meetings_insert"
ON mom_meetings
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- UPDATE: Creator bisa update meeting miliknya
CREATE POLICY "auth_meetings_update_own"
ON mom_meetings
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- DELETE: Semua authenticated user (RBAC di frontend)
CREATE POLICY "auth_meetings_delete"
ON mom_meetings
FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- 11. RAB_DOCUMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "All users can view RAB" ON rab_documents;
DROP POLICY IF EXISTS "Admin can manage RAB" ON rab_documents;

CREATE POLICY "auth_rab_select"
ON rab_documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_rab_write"
ON rab_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 12. RAB_DOCUMENTS_BACKUP TABLE
-- ============================================

DROP POLICY IF EXISTS "All users can view RAB backup" ON rab_documents_backup;
DROP POLICY IF EXISTS "Admin can manage RAB backup" ON rab_documents_backup;

CREATE POLICY "auth_rab_backup_select"
ON rab_documents_backup
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "auth_rab_backup_write"
ON rab_documents_backup
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- COMMENTS / CATATAN
-- ============================================

-- Strategi RLS baru (auth-only):
--   1. Semua tabel: cukup authenticated untuk SELECT dan write
--   2. Ownership check tetap ada di outgoing_letters, letter_histories, mom_meetings
--      → Ini bukan RBAC, ini data integrity (user hanya bisa insert data miliknya sendiri)
--   3. master_panel & master_ongkir: dibuka ke anon untuk embed kalkulator tanpa login
--   4. RBAC (siapa yang boleh akses menu apa) dihandle di frontend
--   5. Workflow transitions (submit, review, approve) tetap via RPC SECURITY DEFINER
--      → RPC bypass RLS, jadi tidak perlu policy khusus untuk workflow
