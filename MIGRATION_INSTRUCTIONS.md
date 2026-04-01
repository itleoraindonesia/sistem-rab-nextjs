# RBAC Overhaul - Migration Instructions

## Overview
This migration overhauls the RBAC system from hardcoded permissions to database-driven roles and permissions.

## Prerequisites
- Access to Supabase Dashboard SQL Editor
- Backup your database before running migrations (Settings → Database → Create backup)

## Migration Order
Run these migrations IN ORDER via Supabase Dashboard → SQL Editor:

1. `supabase/migrations/024_create_departments.sql`
2. `supabase/migrations/025_create_roles_permissions.sql`
3. `supabase/migrations/026_add_stakeholder_type.sql`
4. `supabase/migrations/027_vendor_integration.sql`
5. `supabase/migrations/028_client_integration.sql`
6. `supabase/migrations/029_rls_overhaul.sql`
7. `supabase/migrations/030_cleanup_enums.sql` ← RUN LAST (irreversible)

## Important Notes

### Before Running Migration 030
Migration 030 is IRREVERSIBLE. Before running it:
1. Verify all users have valid `role_id` (no NULLs)
2. Verify frontend code is updated and deployed
3. Test the new permission system thoroughly

### Migration 030 Pre-check
The migration includes a pre-check that will fail if any users have NULL `role_id`.
If this happens, run:
```sql
UPDATE users SET role_id = (SELECT id FROM roles WHERE slug = 'user') WHERE role_id IS NULL;
```

### Rollback Plan
If issues arise after migrations 024-029, you can rollback by:
1. Re-running migration 006_simplify_rls_auth_only.sql (restores old RLS)
2. The old columns (role, departemen) are preserved until migration 030

## Post-Migration Steps
1. Regenerate TypeScript types: `pnpm exec supabase gen types typescript --project-id phfuwunwgzkfzettekkh --schema public > src/types/database.ts`
2. Deploy updated frontend code
3. Test login and permissions for each role
4. Assign departments to users with NULL department_id

## Verification Queries
After migrations, run these to verify:
```sql
-- Check departments
SELECT * FROM departments ORDER BY slug;

-- Check roles
SELECT name, slug, jsonb_array_length(permissions) as permission_count FROM roles;

-- Check department permissions
SELECT d.name, jsonb_array_length(dp.permissions) as permission_count
FROM department_permissions dp
JOIN departments d ON d.id = dp.department_id;

-- Check user migration
SELECT 
  u.nama, 
  r.slug as role_slug, 
  d.name as department,
  u.stakeholder_type,
  u.is_reviewer_eligible,
  u.is_approver_eligible
FROM users u
LEFT JOIN roles r ON r.id = u.role_id
LEFT JOIN departments d ON d.id = u.department_id
ORDER BY u.nama;

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```
