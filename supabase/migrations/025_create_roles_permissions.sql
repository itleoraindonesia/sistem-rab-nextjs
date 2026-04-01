-- Migration: 025_create_roles_permissions.sql
-- Feature: Database-driven Roles & Permissions
-- Purpose: Replace hardcoded PERMISSION_MATRIX with DB-driven roles
-- Date: 2026-04-01
--
-- Safe for production:
--   - Adds role_id as NULLABLE first
--   - Backfills existing role ENUM → role_id FK
--   - Preserves old role ENUM column for rollback
--   - Manager permissions stored separately per department

-- ============================================================
-- STEP 1: Create roles table
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  is_system_role BOOLEAN DEFAULT false,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE roles IS 'Master data roles dengan permission matrix';
COMMENT ON COLUMN roles.permissions IS 'Array permission slugs, contoh: ["dashboard.view","dokumen.create"]';
COMMENT ON COLUMN roles.is_system_role IS 'True untuk role bawaan sistem yang tidak boleh dihapus';

-- ============================================================
-- STEP 2: Create department_permissions table
-- Manager permissions berbeda per departemen, disimpan terpisah
-- ============================================================

CREATE TABLE IF NOT EXISTS department_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(department_id)
);

COMMENT ON TABLE department_permissions IS 'Permission khusus untuk manager per departemen';

-- ============================================================
-- STEP 3: Seed roles
-- ============================================================

INSERT INTO roles (name, slug, is_system_role, permissions) VALUES
  ('Admin', 'admin', true,
    '[
      "dashboard.view",
      "dokumen.create", "dokumen.create.own", "dokumen.submit", "dokumen.review", "dokumen.approve",
      "products.view", "products.create", "products.edit", "products.delete",
      "crm.view", "crm.manage", "crm.create", "crm.edit",
      "master.view", "master.manage",
      "meeting.view", "meeting.manage",
      "supply-chain.view", "supply-chain.manage",
      "files.view", "files.download",
      "users.manage", "users.view",
      "workflow.manage",
      "konstruksi.view", "konstruksi.manage"
    ]'::jsonb
  ),
  ('Manager', 'manager', false, '[]'::jsonb),
  ('Reviewer', 'reviewer', false,
    '["dashboard.view","dokumen.create","dokumen.submit","dokumen.review","konstruksi.view"]'::jsonb
  ),
  ('Approver', 'approver', false,
    '["dashboard.view","dokumen.create","dokumen.submit","dokumen.approve","konstruksi.view"]'::jsonb
  ),
  ('User', 'user', false,
    '["dashboard.view","dokumen.create.own","dokumen.submit","products.view","crm.view","konstruksi.view"]'::jsonb
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- STEP 4: Seed department-specific permissions for managers
-- ============================================================

-- Corsec: dashboard, meeting, files
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "meeting.view", "meeting.manage",
  "files.view"
]'::jsonb
FROM departments d
WHERE d.slug = 'corsec'
ON CONFLICT (department_id) DO NOTHING;

-- Finance: dashboard, dokumen, produk, master, meeting, files
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "dokumen.create",
  "products.view", "products.create", "products.edit",
  "master.view", "master.manage",
  "meeting.view", "meeting.manage",
  "files.view"
]'::jsonb
FROM departments d
WHERE d.slug = 'finance'
ON CONFLICT (department_id) DO NOTHING;

-- Human Capital: dashboard, dokumen (full workflow), meeting, files
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "dokumen.create", "dokumen.submit", "dokumen.review", "dokumen.approve",
  "meeting.view", "meeting.manage",
  "files.view"
]'::jsonb
FROM departments d
WHERE d.slug = 'human-capital'
ON CONFLICT (department_id) DO NOTHING;

-- Konstruksi: dashboard, dokumen, produk, crm, master, meeting, files, konstruksi
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "dokumen.create", "dokumen.submit", "dokumen.review", "dokumen.approve",
  "products.view", "products.create", "products.edit", "products.delete",
  "crm.view", "crm.manage", "crm.create", "crm.edit",
  "master.view", "master.manage",
  "meeting.view", "meeting.manage",
  "files.view",
  "konstruksi.view", "konstruksi.manage"
]'::jsonb
FROM departments d
WHERE d.slug = 'konstruksi'
ON CONFLICT (department_id) DO NOTHING;

-- Marketing: dashboard, crm, meeting, files, konstruksi.view
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "crm.view", "crm.manage", "crm.create", "crm.edit",
  "meeting.view", "meeting.manage",
  "files.view",
  "konstruksi.view"
]'::jsonb
FROM departments d
WHERE d.slug = 'marketing'
ON CONFLICT (department_id) DO NOTHING;

-- PBD: FULL ACCESS (hampir sama dengan admin)
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "dokumen.create", "dokumen.create.own", "dokumen.submit", "dokumen.review", "dokumen.approve",
  "products.view", "products.create", "products.edit", "products.delete",
  "crm.view", "crm.manage", "crm.create", "crm.edit",
  "master.view", "master.manage",
  "meeting.view", "meeting.manage",
  "files.view", "files.download",
  "users.view",
  "workflow.manage",
  "konstruksi.view", "konstruksi.manage"
]'::jsonb
FROM departments d
WHERE d.slug = 'pbd'
ON CONFLICT (department_id) DO NOTHING;

-- SCM: dashboard, supply-chain, meeting, files
INSERT INTO department_permissions (department_id, permissions)
SELECT d.id, '[
  "dashboard.view",
  "supply-chain.view", "supply-chain.manage",
  "meeting.view", "meeting.manage",
  "files.view"
]'::jsonb
FROM departments d
WHERE d.slug = 'scm'
ON CONFLICT (department_id) DO NOTHING;

-- ============================================================
-- STEP 5: Add role_id to users (nullable)
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

COMMENT ON COLUMN users.role_id IS 'FK ke roles. Menggantikan role ENUM.';

-- ============================================================
-- STEP 6: Migrate existing role ENUM → role_id FK
-- ============================================================

UPDATE users u
SET role_id = r.id
FROM roles r
WHERE r.slug = u.role::text
  AND u.role_id IS NULL;

-- ============================================================
-- STEP 7: Create helper functions for RLS
-- ============================================================

-- Function: get current user's role slug
CREATE OR REPLACE FUNCTION get_user_role_slug()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT r.slug
     FROM roles r
     JOIN users u ON u.role_id = r.id
     WHERE u.id = auth.uid()),
    'unknown'
  )
$$;

COMMENT ON FUNCTION get_user_role_slug() IS 'Returns role slug for current user. Returns ''unknown'' if not set.';

-- Function: check if user has a specific permission
-- Admin always returns true
-- Manager checks department_permissions table
-- Other roles check roles.permissions
CREATE OR REPLACE FUNCTION user_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = auth.uid()
      AND u.is_active = true
      AND (
        -- Admin has all permissions
        r.slug = 'admin'
        OR
        -- Manager: check department_permissions
        (r.slug = 'manager' AND EXISTS (
          SELECT 1
          FROM department_permissions dp
          WHERE dp.department_id = u.department_id
            AND dp.permissions ? p_permission
        ))
        OR
        -- Other roles: check roles.permissions
        r.permissions ? p_permission
      )
  )
$$;

COMMENT ON FUNCTION user_has_permission(TEXT) IS 'Check if current user has a specific permission. Admin always true.';

-- Function: get all permissions for current user
CREATE OR REPLACE FUNCTION get_user_permissions()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_slug TEXT;
  v_dept_id UUID;
  v_perms JSONB;
BEGIN
  SELECT r.slug, u.department_id
  INTO v_role_slug, v_dept_id
  FROM users u
  JOIN roles r ON r.id = u.role_id
  WHERE u.id = auth.uid() AND u.is_active = true;

  IF v_role_slug IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;

  -- Admin gets all permissions
  IF v_role_slug = 'admin' THEN
    SELECT permissions INTO v_perms FROM roles WHERE slug = 'admin';
    RETURN COALESCE(v_perms, '[]'::jsonb);
  END IF;

  -- Manager gets department-specific permissions
  IF v_role_slug = 'manager' THEN
    SELECT dp.permissions INTO v_perms
    FROM department_permissions dp
    WHERE dp.department_id = v_dept_id;
    RETURN COALESCE(v_perms, '[]'::jsonb);
  END IF;

  -- Other roles get role permissions
  SELECT permissions INTO v_perms FROM roles WHERE slug = v_role_slug;
  RETURN COALESCE(v_perms, '[]'::jsonb);
END;
$$;

COMMENT ON FUNCTION get_user_permissions() IS 'Returns all permissions for current user as JSONB array.';

-- ============================================================
-- STEP 8: Triggers for updated_at
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_updated_at'
  ) THEN
    CREATE TRIGGER trg_roles_updated_at
      BEFORE UPDATE ON roles
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_department_permissions_updated_at'
  ) THEN
    CREATE TRIGGER trg_department_permissions_updated_at
      BEFORE UPDATE ON department_permissions
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
