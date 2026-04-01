-- Migration: 026_add_stakeholder_type.sql
-- Feature: Stakeholder Type + Reviewer/Approver Eligibility
-- Purpose: Distinguish internal users from vendors/clients, add eligibility markers
-- Date: 2026-04-01
--
-- Safe for production:
--   - All new columns have DEFAULT values
--   - Existing users default to 'internal'
--   - Backfill eligibility from current role ENUM
--   - No existing data is modified or deleted

-- ============================================================
-- STEP 1: Create stakeholder_type ENUM
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stakeholder_type') THEN
    CREATE TYPE stakeholder_type AS ENUM ('internal', 'vendor', 'client');
  END IF;
END $$;

-- ============================================================
-- STEP 2: Add stakeholder_type to users
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS stakeholder_type stakeholder_type DEFAULT 'internal';

COMMENT ON COLUMN users.stakeholder_type IS 'Tipe stakeholder: internal (karyawan), vendor (supplier), client (pemilik proyek)';

-- ============================================================
-- STEP 3: Add reviewer/approver eligibility columns
-- Role 'reviewer' dan 'approver' tetap ada sebagai eligibility marker
-- Boolean columns memungkinkan user biasa juga bisa jadi reviewer/approver
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_reviewer_eligible BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approver_eligible BOOLEAN DEFAULT false;

COMMENT ON COLUMN users.is_reviewer_eligible IS 'User eligible untuk dipilih sebagai reviewer di workflow';
COMMENT ON COLUMN users.is_approver_eligible IS 'User eligible untuk dipilih sebagai approver di workflow';

-- ============================================================
-- STEP 4: Backfill eligibility from current role ENUM
-- ============================================================

UPDATE users
SET is_reviewer_eligible = true
WHERE role::text = 'reviewer'
  AND is_reviewer_eligible = false;

UPDATE users
SET is_approver_eligible = true
WHERE role::text = 'approver'
  AND is_approver_eligible = false;

-- ============================================================
-- STEP 5: Create helper functions for RLS
-- ============================================================

-- Function: get current user's stakeholder type
CREATE OR REPLACE FUNCTION get_user_stakeholder_type()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT stakeholder_type::text FROM users WHERE id = auth.uid()),
    'internal'
  )
$$;

COMMENT ON FUNCTION get_user_stakeholder_type() IS 'Returns stakeholder type for current user. Defaults to ''internal''.';

-- Function: check if current user is vendor
CREATE OR REPLACE FUNCTION is_vendor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND stakeholder_type = 'vendor'
      AND is_active = true
  )
$$;

COMMENT ON FUNCTION is_vendor() IS 'Returns true if current user is a vendor stakeholder.';

-- Function: check if current user is client
CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND stakeholder_type = 'client'
      AND is_active = true
  )
$$;

COMMENT ON FUNCTION is_client() IS 'Returns true if current user is a client stakeholder.';

-- Function: check if current user is internal
CREATE OR REPLACE FUNCTION is_internal_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND stakeholder_type = 'internal'
      AND is_active = true
  )
$$;

COMMENT ON FUNCTION is_internal_user() IS 'Returns true if current user is an internal stakeholder.';
