# User Creation & Onboarding Guide

## Overview
Panduan implementasi sistem user creation dengan email-first approach. User dibuat dengan email saja, data lengkap diisi melalui onboarding flow setelah login pertama.

## Email-First User Creation

### Concept
1. **Admin creates user** dengan email saja di Supabase Auth
2. **User receives magic link** dan bisa login langsung
3. **Profile data collected** melalui onboarding form
4. **Gradual data collection** tanpa blocking user access

### Benefits
- **Flexible Onboarding**: User bisa login dulu, isi data kemudian
- **Reduced Friction**: Tidak perlu data lengkap di awal
- **Scalable**: Mudah untuk bulk user creation
- **User-Friendly**: Progressive disclosure of required information

## Database Schema

### Users Table (Modified)
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  nama VARCHAR(255),              -- NULLABLE
  username VARCHAR(100),          -- NULLABLE, UNIQUE when not null
  nik VARCHAR(50),                -- NULLABLE, UNIQUE when not null
  jabatan VARCHAR(100),
  departemen VARCHAR(100),
  no_hp VARCHAR(50),
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  signature_image TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Changes:**
- `nama`, `username`, `nik` menjadi nullable
- Unique constraints hanya berlaku untuk non-null values
- Email tetap required sebagai identifier

## Implementation Flow

### 1. Admin User Creation
```typescript
// Create user via Supabase Admin API
const { data, error } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'temporary123',  // User can change later
  email_confirm: true
});

// User profile will be created via trigger (optional)
// Or manually through onboarding
```

### 2. First Login Detection
```typescript
// Check if profile data is complete
const { data: profile } = await supabase
  .from('users')
  .select('nama, username, nik, is_active')
  .eq('id', user.id)
  .single();

const needsOnboarding = !profile ||
  !profile.nama ||
  !profile.username ||
  !profile.nik;

if (needsOnboarding) {
  router.push('/onboarding/complete-profile');
}
```

### 3. Onboarding Form
```typescript
// Collect missing profile data
interface OnboardingData {
  nama: string;
  username: string;
  nik: string;
  jabatan?: string;
  departemen?: string;
}

// Validation with conflict checking
async function checkUsernameAvailable(username: string, userId: string) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', userId)
    .single();

  return !data; // true if available
}
```

### 4. Profile Completion
```typescript
async function completeProfile(data: OnboardingData) {
  const user = await supabase.auth.getUser();

  if (!user.data.user) return;

  // Check if profile exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.data.user.id)
    .single();

  if (existing) {
    // UPDATE existing profile
    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        is_active: true
      })
      .eq('id', user.data.user.id);
  } else {
    // INSERT new profile
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.data.user.id,
        email: user.data.user.email!,
        ...data,
        role: 'user',
        is_active: true
      });
  }

  if (error) throw error;
  router.push('/dashboard');
}
```

## Middleware Protection

### Route Guards
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('nama, username, nik, is_active')
      .eq('id', user.id)
      .single();

    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding');
    const needsOnboarding = !profile || !profile.nama || !profile.username || !profile.nik;

    if (needsOnboarding && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/onboarding/complete-profile', request.url));
    }

    if (!needsOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}
```

### Protected Routes
```typescript
// For routes requiring complete profile
export async function requireCompleteProfile(userId: string) {
  const { data: profile } = await supabase
    .from('users')
    .select('nama, username, nik')
    .eq('id', userId)
    .single();

  if (!profile || !profile.nama || !profile.username || !profile.nik) {
    throw new Error('Profile incomplete');
  }

  return profile;
}
```

## Form Validation

### Real-time Validation
```typescript
// Username availability check (debounced)
const [usernameError, setUsernameError] = useState('');

const checkUsername = useCallback(
  debounce(async (username: string) => {
    if (!username) return;

    const available = await checkUsernameAvailable(username, userId);
    if (!available) {
      setUsernameError('Username sudah digunakan');
    } else {
      setUsernameError('');
    }
  }, 500),
  [userId]
);
```

### Business Rules
- **Username**: 3-30 characters, alphanumeric + underscore
- **NIK**: 16 digits, unique across system
- **Nama**: Required, 2-100 characters
- **Departemen**: Must match predefined list
- **Jabatan**: Free text, optional

## Error Handling

### Conflict Resolution
```typescript
// Handle unique constraint violations
try {
  await completeProfile(data);
} catch (error) {
  if (error.code === '23505') { // Unique violation
    if (error.message.includes('username')) {
      setError('Username sudah digunakan');
    } else if (error.message.includes('nik')) {
      setError('NIK sudah terdaftar');
    }
  }
}
```

### Network Error Recovery
```typescript
// Retry mechanism for failed submissions
const submitWithRetry = async (data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await completeProfile(data);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Security Considerations

### Data Protection
- **Profile Visibility**: Users can only access their own profiles
- **RLS Policies**: Row-level security on users table
- **Audit Trail**: Track profile changes and creations

### Authentication Security
- **Magic Link**: No password sharing required
- **Session Management**: Automatic token refresh
- **Rate Limiting**: Prevent brute force attacks

## UI/UX Design

### Onboarding Flow
1. **Welcome Screen**: Explain what data is needed
2. **Step-by-Step Form**: Break into logical sections
3. **Progress Indicator**: Show completion status
4. **Validation Feedback**: Real-time error correction
5. **Success Confirmation**: Clear next steps

### Progressive Enhancement
- **Basic Access**: Allow limited app access during onboarding
- **Feature Gating**: Some features require complete profile
- **Reminder Prompts**: Gentle nudges to complete profile
- **Graceful Degradation**: Fallback for missing profile data

## Testing Strategy

### Unit Tests
- **Validation Logic**: Username/NIK availability checks
- **Form Submission**: Success and error scenarios
- **Middleware Guards**: Route protection logic

### Integration Tests
- **Auth Flow**: Magic link to profile completion
- **Database Operations**: Profile creation and updates
- **Middleware**: Route redirection logic

### E2E Tests
- **Complete Flow**: Email creation to dashboard access
- **Error Recovery**: Network failures and retries
- **Mobile Experience**: Responsive design validation

## Monitoring & Analytics

### Completion Metrics
- **Onboarding Completion Rate**: % users completing profile
- **Time to Complete**: Average onboarding duration
- **Drop-off Points**: Where users abandon onboarding
- **Field Completion Rates**: Which fields are skipped

### User Behavior
- **Login Patterns**: When users complete onboarding
- **Feature Usage**: Post-onboarding engagement
- **Support Requests**: Onboarding-related help tickets

## Troubleshooting

### Common Issues

#### Profile Not Created
**Symptoms:** User can login but no profile in database
**Solutions:**
- Check trigger function exists and is active
- Manually create profile via admin panel
- Verify user ID matches between auth.users and public.users

#### Unique Constraint Errors
**Symptoms:** "Username already taken" errors
**Solutions:**
- Implement real-time availability checking
- Suggest alternative usernames
- Allow profile updates for conflicts

#### Middleware Redirect Loops
**Symptoms:** Infinite redirects between pages
**Solutions:**
- Check middleware logic for circular redirects
- Verify onboarding page detection
- Test with different user states

#### Session Issues
**Symptoms:** User logged out during onboarding
**Solutions:**
- Extend session timeout for onboarding
- Implement session recovery
- Use local storage for form state

### Debug Procedures

#### Profile Status Check
```sql
SELECT
  au.email,
  pu.nama,
  pu.username,
  pu.nik,
  pu.is_active,
  au.created_at as auth_created,
  pu.created_at as profile_created
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'user@example.com';
```

#### Onboarding Analytics
```sql
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN nama IS NOT NULL THEN 1 END) as has_name,
  COUNT(CASE WHEN username IS NOT NULL THEN 1 END) as has_username,
  COUNT(CASE WHEN nik IS NOT NULL THEN 1 END) as has_nik,
  COUNT(CASE WHEN nama IS NOT NULL AND username IS NOT NULL AND nik IS NOT NULL THEN 1 END) as complete_profiles
FROM public.users;
```

## Migration Path

### Existing Users
For systems with existing users:
1. **Backup Data**: Full database backup
2. **Schema Migration**: Make fields nullable
3. **Data Validation**: Check for existing conflicts
4. **Profile Completion**: Prompt existing users to complete profiles

### Gradual Rollout
- **Feature Flag**: Enable email-first creation for new users
- **A/B Testing**: Compare completion rates
- **Rollback Plan**: Ability to revert to full-data requirement
- **Communication**: User notifications about changes

## Future Enhancements

### Advanced Features
- **Social Login**: OAuth integration for easier signup
- **Profile Photos**: Avatar upload during onboarding
- **Team Invitations**: Bulk user creation with team context
- **Custom Fields**: Department-specific profile requirements

### Integration Capabilities
- **HR Systems**: Sync employee data automatically
- **Directory Services**: LDAP/Active Directory integration
- **SSO**: Single sign-on for enterprise users
- **API Provisioning**: Automated user creation via API

---

*Last Updated: 2026-04-04*
*Status: Production Ready*