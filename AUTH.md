# Authentication Documentation

## Overview

Sistem RAB Leora menggunakan **Supabase Auth** untuk authentication dan authorization. Supabase menyediakan built-in auth system yang aman, scalable, dan mudah diintegrasikan dengan Next.js.

## Table of Contents

1. [Setup](#setup)
2. [User Roles](#user-roles)
3. [Database Schema](#database-schema)
4. [Authentication Flow](#authentication-flow)
5. [Usage Examples](#usage-examples)
6. [Security](#security)

---

## Setup

### 1. Install Dependencies

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 2. Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Run the migration file: `supabase/migrations/001_create_users_table.sql`

This creates:
- `public.users` table
- `public.instansi` table
- User roles enum
- Row Level Security (RLS) policies
- Auto-create profile trigger

### 4. Create First User

Via Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. User profile will be auto-created in `public.users` table

---

## User Roles

### Role Types

```typescript
type UserRole = 'admin' | 'manager' | 'reviewer' | 'approver' | 'user'
```

### Role Permissions Matrix

| Action | admin | manager | reviewer | approver | user |
|--------|-------|---------|----------|----------|------|
| **Buat Dokumen** | ✅ All | ✅ Dept | ✅ All | ✅ All | ✅ Own |
| **Submit Review** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Review Dokumen** | ✅ All | ✅ Dept | ✅ All | ❌ | ❌ |
| **Final Approve** | ✅ All | ✅ Dept | ❌ | ✅ All | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View All Docs** | ✅ | ✅ Dept | ✅ | ✅ | Own only |
| **Master Data** | ✅ | ✅ | ❌ | ❌ | ❌ |

### Role Descriptions

#### 1. **Admin** (Super User)
- Full access to all modules
- Manage users, instansi, and master data
- Can bypass workflow approvals
- Access to system settings

#### 2. **Manager** (Department Head)
- Create and manage documents for their department
- Approve documents within their department
- View department-level dashboards and reports
- Cannot manage users or system settings

#### 3. **Reviewer** (Quality Control)
- Review submitted documents
- Request revisions or approve for next stage
- Cannot give final approval
- View all documents for review

#### 4. **Approver** (Final Decision Maker)
- Give final approval after review
- Generate document numbers
- Publish documents
- Cannot review (only approve/reject)

#### 5. **User** (Staff)
- Create draft documents
- Submit documents for review
- View only their own documents
- Basic access to modules

---

## Database Schema

### Users Table

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nik VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  jabatan VARCHAR(100),
  departemen VARCHAR(100),
  no_hp VARCHAR(50),
  instansi_id UUID REFERENCES public.instansi(id),
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  signature_image TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Instansi Table

```sql
CREATE TABLE public.instansi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama VARCHAR(255) NOT NULL UNIQUE,
  alamat TEXT,
  telepon VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Default Instansi

- PT Maju Mandiri Gemilang Terang
- PT Leora Konstruksi Indonesia
- PT Niskala Teknologi

---

## Authentication Flow

### Login Flow

```
User enters email + password
        ↓
supabase.auth.signInWithPassword()
        ↓
Session created (stored in cookies)
        ↓
Fetch user profile from public.users
        ↓
Redirect to dashboard
```

### Logout Flow

```
User clicks "Keluar"
        ↓
supabase.auth.signOut()
        ↓
Clear session cookies
        ↓
Redirect to /login
```

### Auto Profile Creation

When a new user signs up via Supabase Auth:

```sql
-- Trigger automatically creates profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Profile is created with:
- `id` from auth.users
- `email` from auth.users
- `nama` from metadata or email
- `username` from metadata or email prefix
- `nik` auto-generated: `NIK-{uuid}`
- `role` default: `user`

---

## Usage Examples

### Client Component (Browser)

```tsx
import { supabase } from '@/lib/supabase/client'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Logout
await supabase.auth.signOut()

// Get current session
const { data: { session } } = await supabase.auth.getSession()

// Get user profile
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single()
```

### Server Component

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return <div>Welcome {profile.nama}</div>
}
```

### Middleware (Auto Session Refresh)

File: `src/middleware.ts`

```tsx
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

This middleware automatically:
- Refreshes auth session on every request
- Updates cookies
- Keeps user logged in

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

#### Users Table Policies

1. **Users can view own profile**
   ```sql
   CREATE POLICY "Users can view own profile"
     ON public.users FOR SELECT
     USING (auth.uid() = id);
   ```

2. **Users can update own profile**
   ```sql
   CREATE POLICY "Users can update own profile"
     ON public.users FOR UPDATE
     USING (auth.uid() = id);
   ```

3. **Admins can view all users**
   ```sql
   CREATE POLICY "Admins can view all users"
     ON public.users FOR SELECT
     USING (
       EXISTS (
         SELECT 1 FROM public.users
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

4. **Admins can manage all users**
   - INSERT, UPDATE, DELETE policies for admins

#### Instansi Table Policies

1. **All authenticated users can view**
   ```sql
   CREATE POLICY "Authenticated users can view instansi"
     ON public.instansi FOR SELECT
     TO authenticated
     USING (true);
   ```

2. **Only admins can modify**
   ```sql
   CREATE POLICY "Admins can manage instansi"
     ON public.instansi FOR ALL
     USING (
       EXISTS (
         SELECT 1 FROM public.users
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

### Best Practices

1. **Never expose service_role key** in client-side code
2. **Always use RLS policies** for data access control
3. **Validate user roles** before performing sensitive operations
4. **Use middleware** for automatic session refresh
5. **Store sensitive data** (passwords) only in auth.users (managed by Supabase)
6. **Implement rate limiting** for login attempts (via Supabase settings)

---

## Troubleshooting

### Common Issues

#### 1. "Invalid login credentials"
- Check if user exists in Supabase Dashboard
- Verify email and password are correct
- Check if user is confirmed (email verification)

#### 2. "User profile not found"
- Ensure migration was run successfully
- Check if trigger `on_auth_user_created` exists
- Manually create profile if needed

#### 3. "Session expired"
- Middleware should auto-refresh
- Check if middleware is configured correctly
- Clear cookies and login again

#### 4. "Permission denied"
- Check RLS policies
- Verify user role in database
- Ensure user is authenticated

### Debug Commands

```sql
-- Check if user profile exists
SELECT * FROM public.users WHERE email = 'user@example.com';

-- Check user role
SELECT nama, role FROM public.users WHERE id = 'user-uuid';

-- View all RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check auth users
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

---

## Next Steps

1. **Create first admin user** via Supabase Dashboard
2. **Update user role** to 'admin' in database
3. **Test login** at `/login`
4. **Implement protected routes** (optional)
5. **Create register page** (optional)

For detailed setup instructions, see: `supabase/README.md`
