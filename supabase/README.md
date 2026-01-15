# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready (~2 minutes)

## 2. Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

## 3. Add to Environment Variables

Create `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 4. Run Database Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste the content from `supabase/migrations/001_create_users_table.sql`
4. Run the query

This will create:
- `instansi` table (companies/organizations)
- `users` table (extends auth.users)
- User roles enum
- Row Level Security (RLS) policies
- Triggers for auto-creating user profiles
- Indexes for performance

## 5. Configure Email Auth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

## 6. Test the Setup

1. Restart your Next.js dev server: `pnpm dev`
2. The middleware will now handle auth sessions automatically
3. You can now use Supabase Auth in your app!

## Database Schema

### Users Table
```sql
- id (UUID, FK to auth.users)
- nik (VARCHAR, UNIQUE)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- nama (VARCHAR)
- jabatan (VARCHAR)
- departemen (VARCHAR)
- no_hp (VARCHAR)
- instansi_id (UUID, FK to instansi)
- role (ENUM: admin, manager, reviewer, approver, user)
- is_active (BOOLEAN)
- avatar_url (TEXT)
- signature_image (TEXT)
- last_login_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

### Instansi Table
```sql
- id (UUID)
- nama (VARCHAR, UNIQUE)
- alamat (TEXT)
- telepon (VARCHAR)
- email (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

## Row Level Security (RLS)

- Users can view and update their own profile
- Admins can view, create, update, and delete all users
- All authenticated users can view instansi
- Only admins can manage instansi

## Next Steps

1. Create login/register pages
2. Add auth guards to protected routes
3. Use `createClient()` from `@/lib/supabase/server` in Server Components
4. Use `supabase` from `@/lib/supabase/client` in Client Components
