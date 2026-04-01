-- Migration: 030_cleanup_enums.sql
-- Feature: Cleanup Old Schema Elements
-- Purpose: Drop deprecated ENUM types and old columns after migration verified
-- Date: 2026-04-01
--
-- IMPORTANT: Run this migration ONLY after confirming:
--   1. All users have valid role_id (no NULLs)
--   2. All users with departemen have valid department_id
--   3. Frontend code updated to use role_id and department_id
--   4. No code references users.role or users.departemen
--
-- This migration is NOT reversible. Keep a backup before running.

-- ============================================================
-- PRE-CHECK: Verify data integrity before dropping old columns
-- ============================================================

-- Check for users without role_id
DO $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM users WHERE role_id IS NULL;
  IF v_count > 0 THEN
    RAISE EXCEPTION 'Cannot cleanup: % users still have NULL role_id. Please backfill first.', v_count;
  END IF;
END $$;

-- ============================================================
-- STEP 1: Set NOT NULL on new columns
-- ============================================================

ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE users ALTER COLUMN stakeholder_type SET NOT NULL;

-- department_id can remain NULL (users without department assignment)

-- ============================================================
-- STEP 2: Drop old ENUM type
-- First drop any dependencies, then drop the type
-- ============================================================

-- Drop dependency: users.role column default
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Drop the ENUM type (CASCADE handles any remaining dependencies)
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================
-- STEP 3: Drop old columns
-- ============================================================

ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users DROP COLUMN IF EXISTS departemen;

-- ============================================================
-- STEP 4: Create useful views for common queries
-- ============================================================

-- View: Full user profile with role and department info
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  u.id,
  u.nik,
  u.username,
  u.email,
  u.nama,
  u.jabatan,
  u.no_hp,
  u.is_active,
  u.avatar_url,
  u.signature_image,
  u.last_login_at,
  u.stakeholder_type,
  u.is_reviewer_eligible,
  u.is_approver_eligible,
  r.name AS role_name,
  r.slug AS role_slug,
  r.permissions AS role_permissions,
  d.name AS department_name,
  d.slug AS department_slug,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
LEFT JOIN departments d ON d.id = u.department_id;

COMMENT ON VIEW user_profiles IS 'Denormalized view of users with role and department info. Use for read queries.';

-- ============================================================
-- STEP 5: Create indexes for common query patterns
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_stakeholder_type ON users(stakeholder_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_reviewer_eligible ON users(is_reviewer_eligible);
CREATE INDEX IF NOT EXISTS idx_users_is_approver_eligible ON users(is_approver_eligible);
