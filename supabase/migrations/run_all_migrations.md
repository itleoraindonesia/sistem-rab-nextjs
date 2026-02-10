# How to Run Letter Workflow Migrations

Since Supabase CLI is not linked locally, you have two options:

## Option 1: Link Supabase Project (Recommended)

1. Link your project:
```bash
npx supabase link
```

2. Enter your project URL and API key when prompted
   - You can find these in: https://supabase.com/dashboard/project/phfuwunwgzkfzettekkh/settings/api
   - Copy Project URL and anon/public key

3. Push all migrations:
```bash
npx supabase db push
```

## Option 2: Run Migrations Manually via Dashboard

### Step 1: Go to Supabase Dashboard
https://supabase.com/dashboard/project/phfuwunwgzkfzettekkh/sql/new

### Step 2: Run Migrations in Order

Run each migration file in order. Open each file, copy the SQL, and paste it into the SQL Editor.

**Migration 1: Create Test Users**
1. Open `supabase/migrations/003_create_letter_test_users.sql`
2. Copy all SQL
3. Paste into SQL Editor
4. Click "Run"

**Migration 2: Seed Document Types**
1. Open `supabase/migrations/004_seed_document_types.sql`
2. Copy all SQL
3. Paste into SQL Editor
4. Click "Run"

**Migration 3: Seed Workflow Configs**
1. Open `supabase/migrations/005_seed_workflow_configs.sql`
2. Copy all SQL
3. Paste into SQL Editor
4. Click "Run"

**Migration 4: Create Document Number Generator**
1. Open `supabase/migrations/006_create_test_document_number_function.sql`
2. Copy all SQL
3. Paste into SQL Editor
4. Click "Run"

### Step 3: Verify Migrations

Run this verification query:
```sql
-- Check test users
SELECT username, email, role FROM public.users 
WHERE email IN ('reviewer1@test.com', 'reviewer2@test.com', 'approver@test.com');

-- Check document types
SELECT code, name, category FROM document_types ORDER BY category;

-- Check workflow configs
SELECT dt.code as doc_type, dwc.stage_type, u.username as assigned_to
FROM document_workflow_configs dwc
JOIN document_types dt ON dwc.document_type_id = dt.id
JOIN users u ON dwc.user_id = u.id
ORDER BY dt.code, dwc.sequence;

-- Check document number function
SELECT generate_test_document_number() as test_number;
```

## After Running Migrations

### Test Login Credentials

Login with these accounts to test:

**Reviewer 1:**
- Email: reviewer1@test.com
- Password: password123

**Reviewer 2:**
- Email: reviewer2@test.com
- Password: password123

**Approver:**
- Email: approver@test.com
- Password: password123

### Update Types (If Needed)

After running migrations, regenerate TypeScript types:

```bash
pnpm db:pull
```

This will update `src/types/database.ts` with the new tables.

## Troubleshooting

### Issue: "User already exists"
**Solution:** Check if users already exist, you can skip user creation if they exist.

### Issue: "Function already exists"
**Solution:** Drop the function first or use `CREATE OR REPLACE` (already in the migration).

### Issue: "Permission denied"
**Solution:** Make sure you're logged in to Supabase with correct project access.

## Verification Checklist

- [ ] All 4 migrations ran successfully
- [ ] Test users created (reviewer1, reviewer2, approver)
- [ ] Document types seeded (10 types)
- [ ] Workflow configs created (for all document types)
- [ ] Document number function works (returns TEST-1)
- [ ] TypeScript types updated (optional but recommended)