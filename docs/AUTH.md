# Authentication Documentation

## Overview

Sistem RAB Leora menggunakan **Supabase Auth** untuk authentication dan authorization. Supabase menyediakan built-in auth system yang aman, scalable, dan mudah diintegrasikan dengan Next.js.

## Table of Contents

1. [Setup](#setup)
2. [User Roles](#user-roles)
3. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [Usage Examples](#usage-examples)
7. [Security](#security)

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

## Role-Based Access Control (RBAC)

### Overview

Sistem menggunakan **Role-Based Access Control (RBAC)** dengan department-based permissions untuk mengatur akses user ke berbagai modul aplikasi.

### Department List

- **Corsec**: Corporate Security
- **Finance**: Keuangan & Accounting
- **Human Capital**: SDM & HR (sebelumnya HR)
- **Konstruksi**: Teknik & Konstruksi (sebelumnya IT)
- **Marketing**: Pemasaran & Sales
- **PBD**: Product Business Development (Full Access)
- **SCM**: Supply Chain Management

### Permission System

#### Manager Permissions by Department

| Department | Dashboard | Dokumen | Produk & RAB | CRM | Master Data | Meeting | Supply Chain |
|------------|-----------|---------|--------------|-----|-------------|---------|--------------|
| **Corsec** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Finance** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Human Capital** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Konstruksi** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Marketing** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| **PBD** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SCM** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

#### Role Permissions

- **Admin**: Full access semua modul
- **Manager**: Department-based access sesuai tabel di atas
- **Reviewer**: Create + Submit + Review dokumen
- **Approver**: Create + Submit + Approve dokumen
- **User**: Create own + Submit + View limited

### Frontend Implementation

#### Permission Hooks

```tsx
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, canAccess, user } = usePermissions()

  if (!hasPermission('dokumen.create')) {
    return <div>Access Denied</div>
  }

  return <CreateDocumentForm />
}
```

#### Permission Guards

```tsx
import { PermissionGuard, RoleGuard } from '@/components/auth/PermissionGuard'

// Permission-based rendering
<PermissionGuard permissions={['dokumen.create']}>
  <CreateButton />
</PermissionGuard>

// Role-based rendering
<RoleGuard roles={['admin', 'manager']}>
  <AdminPanel />
</RoleGuard>
```

#### Route Protection

```tsx
import { requirePermission } from '@/lib/auth/routeGuard'

export default async function AdminPage() {
  const user = await requirePermission('users.manage')
  // Page content - auto redirect if no permission
}
```

### Menu Filtering

Sidebar menu otomatis di-filter berdasarkan user permissions dan department. Menu yang tidak diizinkan akan disembunyikan.

---

## Database Schema

### Users Table

```sql
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nik character varying NOT NULL UNIQUE,
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  nama character varying NOT NULL,
  jabatan character varying,
  departemen character varying,
  no_hp character varying,
  role USER-DEFINED DEFAULT 'user'::user_role,
  is_active boolean DEFAULT true,
  avatar_url text,
  signature_image text,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
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

---

## Authentication Flow

### Login Flow (Magic Link)

```
User enters email
        ↓
supabase.auth.signInWithOtp() - Send magic link
        ↓
Email sent to user inbox
        ↓
User clicks magic link in email
        ↓
Redirect to /auth/callback with token
        ↓
supabase.auth.exchangeCodeForSession()
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
- `nik` form metadata
- `role` default: `user`

---

## Usage Examples

### Client Component (Browser)

```tsx
import { supabase } from '@/lib/supabase/client'

// Login with Magic Link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
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

// Permission checking
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, user } = usePermissions()

  if (!hasPermission('dokumen.create')) {
    return <div>Access Denied</div>
  }

  return <CreateDocumentForm />
}
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
2. **Update user role & department** in database (set role='admin', departemen='PBD' for full access)
3. **Test magic link login** at `/login`
4. **Setup RBAC permissions** - assign roles & departments to users
5. **Test permission system** with different user accounts
6. **Implement additional route protection** as needed
7. **Create user management UI** (optional)

## RBAC Setup Checklist

- [ ] Create users with different roles (admin, manager, reviewer, approver, user)
- [ ] Assign departments to manager users (Corsec, Finance, Human Capital, Konstruksi, Marketing, PBD, SCM)
- [ ] Test menu filtering for each role/department combination
- [ ] Test route access restrictions
- [ ] Verify permission guards work correctly
- [ ] Test unauthorized access redirects

For detailed setup instructions, see: `supabase/README.md`
