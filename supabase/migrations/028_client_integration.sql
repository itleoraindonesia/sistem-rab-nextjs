-- Migration: 028_client_integration.sql
-- Feature: Client Integration
-- Purpose: Link projects to users table, add RLS for client access
-- Date: 2026-04-01
--
-- Safe for production:
--   - client_id is NULLABLE (existing projects without client user stay valid)
--   - RLS policies check stakeholder_type before restricting
--   - Internal users still see all project data
--   - Clients only see their own projects
--   - customer_name preserved for display/transition

-- ============================================================
-- STEP 1: Add client_id to projects
-- ============================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES users(id) ON DELETE SET NULL;

COMMENT ON COLUMN projects.client_id IS 'FK ke users (stakeholder_type=client). NULL untuk project lama yang belum terintegrasi.';

-- ============================================================
-- STEP 2: Add indexes for RLS queries
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);

-- ============================================================
-- STEP 3: RLS for projects
-- Enable RLS if not already enabled
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'projects' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', r.policyname);
  END LOOP;
END $$;

-- SELECT: Internal users see all, clients see only their own projects
CREATE POLICY "projects_select"
ON projects FOR SELECT
TO authenticated
USING (
  is_internal_user()
  OR client_id = auth.uid()
);

-- INSERT: Only internal users can create projects
CREATE POLICY "projects_insert"
ON projects FOR INSERT
TO authenticated
WITH CHECK (is_internal_user());

-- UPDATE: Only internal users can update projects
CREATE POLICY "projects_update"
ON projects FOR UPDATE
TO authenticated
USING (is_internal_user())
WITH CHECK (is_internal_user());

-- DELETE: Only internal users can delete projects
CREATE POLICY "projects_delete"
ON projects FOR DELETE
TO authenticated
USING (is_internal_user());

-- ============================================================
-- STEP 4: RLS for project_summary view
-- View inherits RLS from underlying tables, but add explicit policy
-- ============================================================

-- The project_summary view will automatically respect RLS on projects,
-- vendor_spk, vendor_payment, and customer_payment tables.
-- No additional policy needed for the view itself.
