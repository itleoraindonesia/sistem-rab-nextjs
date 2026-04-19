# Authentication & Authorization Architecture

## Overview
Sistem menggunakan **Supabase Auth** untuk authentication dengan Magic Link flow. Authorization menggunakan Role-Based Access Control (RBAC) dengan permission matrix yang dikontrol di frontend.

## Authentication System

### Setup Requirements
- **Supabase Project**: Configured dengan URL dan anon key
- **Environment Variables**:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
  ```

### Magic Link Flow
```
1. User enters email → supabase.auth.signInWithOtp()
2. Email sent to user → Magic link with token
3. User clicks link → Redirect to /auth/callback
4. Token exchange → Session created
5. User profile fetched from public.users
6. Redirect to dashboard
```

### Session Management
- **Auto-refresh**: Middleware handles token refresh setiap request
- **Cookie storage**: Secure HTTP-only cookies
- **Timeout**: Automatic logout setelah inactivity

## User Roles & Permissions

### Role Types
```typescript
type UserRole = 'admin' | 'manager' | 'reviewer' | 'approver' | 'user'
```

### Role Capabilities Matrix

| Action | admin | manager | reviewer | approver | user |
|--------|-------|---------|----------|----------|------|
| Create Documents | ✅ All | ✅ Dept | ✅ All | ✅ All | ✅ Own |
| Submit for Review | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review Documents | ✅ All | ✅ Dept | ✅ All | ❌ | ❌ |
| Final Approval | ✅ All | ✅ Dept | ❌ | ✅ All | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Docs | ✅ | ✅ Dept | ✅ | ✅ | Own only |
| Master Data | ✅ | ✅ | ❌ | ❌ | ❌ |

### Department-Based Manager Access

| Department | Dashboard | Dokumen | Produk & RAB | CRM | Master Data | Meeting | Supply Chain |
|------------|-----------|---------|--------------|-----|-------------|---------|--------------|
| Corsec | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Finance | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Human Capital | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Konstruksi | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Marketing | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| PBD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SCM | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nik VARCHAR UNIQUE,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  nama VARCHAR NOT NULL,
  jabatan VARCHAR,
  departemen VARCHAR,
  no_hp VARCHAR,
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  signature_image TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Implementation

### Row Level Security (RLS)
All tables use auth-only policies:
- **Users table**: Users can view/edit own profile, admins can manage all
- **Instansi table**: All authenticated users can read, admins can modify
- **Business tables**: Authenticated users have full access (frontend controls permissions)

### Frontend Permission System
- **Permission Matrix**: Hardcoded di `src/lib/permissions.ts`
- **Permission Hooks**: `usePermissions()` hook untuk component access
- **Permission Guards**: `<PermissionGuard>`, `<RoleGuard>`, `<DepartmentGuard>` components
- **Route Guards**: Server-side protection dengan `requirePermission()`

## Forgot Password Setup

### Supabase Dashboard Configuration

#### 1. Site URL
Set sesuai environment:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

#### 2. Redirect URLs
Tambahkan URLs berikut:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/reset-password`

#### 3. Email Templates
Configure reset password template di Authentication → Email Templates:
```html
<h2>Reset Password</h2>
<p>Hi {{ .User.Email }},</p>
<p>Klik link di bawah ini untuk reset password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>Link ini akan kadaluarsa dalam 1 jam.</p>
<p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
```

#### 4. SMTP Configuration (Optional)
Untuk production, configure custom SMTP di Authentication → Email Provider:
- **Host**: smtp.your-provider.com
- **Port**: 587 (TLS) or 465 (SSL)
- **Credentials**: SMTP username/password

### Implementation Flow
```
1. User clicks "Lupa Password?"
2. Enter email → API call to supabase.auth.resetPasswordForEmail()
3. Email sent with reset link
4. User clicks link → Redirect to /auth/reset-password?token=...
5. Form to enter new password
6. Password updated → Redirect to login
```

## Usage Examples

### Client-Side Authentication
```typescript
// Login with magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})

// Logout
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Permission Checking
```typescript
// In components
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { hasPermission, user } = usePermissions()

  if (!hasPermission('dokumen.create')) {
    return <div>Access Denied</div>
  }

  return <CreateDocumentForm />
}
```

### Route Protection
```typescript
// Server-side guard
import { requirePermission } from '@/lib/auth/routeGuard'

export default async function AdminPage() {
  const user = await requirePermission('users.manage')
  // Page content - auto redirect if no permission
}
```

## Troubleshooting

### Common Issues

#### "Invalid login credentials"
- Check if user exists in Supabase Dashboard
- Verify email verification status
- Check Supabase logs for authentication errors

#### "User profile not found"
- Ensure migration ran successfully
- Check if auto-profile creation trigger is active
- Manually create profile if needed

#### "Session expired"
- Middleware should auto-refresh tokens
- Check if middleware is configured correctly
- Verify cookie settings

#### "Permission denied"
- Check RLS policies in database
- Verify user role in users table
- Check permission matrix configuration

### Debug Commands
```sql
-- Check user profile
SELECT * FROM public.users WHERE email = 'user@example.com';

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check auth users
SELECT * FROM auth.users WHERE email = 'user@example.com';
```

## Migration Notes

### From Previous Setup
- **Before**: Manual user creation, inconsistent permissions
- **After**: Automated profile creation, consistent RBAC
- **Migration**: Run user profile backfill for existing auth users

### Environment-Specific Config
- **Development**: Local Supabase instance, basic auth
- **Staging**: Separate Supabase project, full features
- **Production**: Production Supabase project, enhanced security

---

*Last Updated: 2026-04-04*
*Status: Production Ready*