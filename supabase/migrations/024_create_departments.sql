-- Migration: 024_create_departments.sql
-- Feature: Departments Table
-- Purpose: Normalize departemen VARCHAR into proper departments table with FK
-- Date: 2026-04-01
--
-- Safe for production:
--   - Adds department_id as NULLABLE first
--   - Backfills existing data with case-insensitive match
--   - Preserves old departemen column for rollback
--   - Users with NULL departemen stay NULL (admin assigns later)

-- ============================================================
-- STEP 1: Create departments table
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE departments IS 'Master data departemen perusahaan';
COMMENT ON COLUMN departments.name IS 'Nama departemen (display), contoh: Human Capital';
COMMENT ON COLUMN departments.slug IS 'Slug lowercase untuk permission lookup, contoh: human-capital';

-- ============================================================
-- STEP 2: Seed departments
-- ============================================================

INSERT INTO departments (name, slug, description) VALUES
  ('Corsec', 'corsec', 'Corporate Secretary'),
  ('Finance', 'finance', 'Finance & Accounting'),
  ('Human Capital', 'human-capital', 'Human Resources'),
  ('Konstruksi', 'konstruksi', 'Construction & Engineering'),
  ('Marketing', 'marketing', 'Marketing & Sales'),
  ('PBD', 'pbd', 'Product Business Development'),
  ('SCM', 'scm', 'Supply Chain Management')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 3: Add department_id to users (nullable)
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id);

COMMENT ON COLUMN users.department_id IS 'FK ke departments. Menggantikan departemen VARCHAR.';

-- ============================================================
-- STEP 4: Migrate existing departemen data (case-insensitive)
-- ============================================================

UPDATE users u
SET department_id = d.id
FROM departments d
WHERE u.departemen IS NOT NULL
  AND LOWER(u.departemen) = LOWER(d.name)
  AND u.department_id IS NULL;

-- ============================================================
-- STEP 5: Create helper functions for RLS
-- ============================================================

-- Function: get current user's department slug
CREATE OR REPLACE FUNCTION get_user_department_slug()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT d.slug
     FROM departments d
     JOIN users u ON u.department_id = d.id
     WHERE u.id = auth.uid()),
    'unknown'
  )
$$;

COMMENT ON FUNCTION get_user_department_slug() IS 'Returns department slug for current user. Returns ''unknown'' if not set.';

-- ============================================================
-- STEP 6: Trigger for updated_at
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_departments_updated_at'
  ) THEN
    CREATE TRIGGER trg_departments_updated_at
      BEFORE UPDATE ON departments
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
