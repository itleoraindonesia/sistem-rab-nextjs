# 🔧 Setup: User Creation dengan Email Dulu, Data Menyusul

## 📋 Konsep

Dengan setup ini, Anda bisa:
1. ✅ **Buat user di auth.users** dengan email saja
2. ✅ **Data di public.users** diisi **menyusul** (manual atau via form)
3. ✅ **Tidak ada error** jika data belum lengkap
4. ✅ **Lebih fleksibel** untuk onboarding user

## 🎯 Workflow

```
1. Admin buat user via Supabase Auth (email + password)
   ↓
2. User masuk ke auth.users (langsung bisa login)
   ↓
3. Entry di public.users TIDAK otomatis dibuat
   ↓
4. Admin/User isi data lengkap via form aplikasi
   ↓
5. Data disimpan ke public.users (INSERT atau UPDATE)
```

## 🚀 Cara Setup

### Step 1: Jalankan Migration untuk Ubah Constraint

File: `supabase/migrations/make_users_fields_optional.sql`

**Apa yang dilakukan:**
- Membuat `nama`, `username`, `nik` menjadi **nullable** (boleh kosong)
- Tetap menjaga **unique constraint** untuk `username` dan `nik` (tapi boleh NULL)
- `email` tetap **required**

**Cara jalankan:**
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy-paste isi file `make_users_fields_optional.sql`
3. **Run** script

### Step 2: Setup Trigger (Optional Mode)

File: `supabase/migrations/fix_auto_user_creation.sql`

**Pilihan yang tersedia:**

#### **OPTION 1: Skip Auto-Creation** (Recommended) ✅
User dibuat di `auth.users` saja, `public.users` diisi manual nanti.

```sql
-- Sudah aktif by default di script
RAISE NOTICE 'New auth user created: %. Public.users entry can be created manually.';
RETURN NEW;
```

#### **OPTION 2: Create Minimal Entry**
Buat entry minimal dengan data temporary, bisa diupdate nanti.

Uncomment bagian ini di script:
```sql
INSERT INTO public.users (id, email, nama, username, nik, role, is_active)
VALUES (
  NEW.id,
  NEW.email,
  'User-' || LEFT(NEW.id::TEXT, 8),  -- Temporary
  'user_' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8),  -- Temporary
  'NIK-' || LEFT(REPLACE(NEW.id::TEXT, '-', ''), 8),  -- Temporary
  'user',
  false  -- Inactive sampai data lengkap
);
```

**Cara jalankan:**
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy-paste isi file `fix_auto_user_creation.sql`
3. **Run** script

### Step 3: Update Database Types (TypeScript)

File: `src/types/database.ts`

Setelah migration, regenerate types:

```bash
npx supabase gen types typescript --project-id phfuwunwgzkfzettekkh --schema public > src/types/database.ts
```

Atau update manual di `users` table:

```typescript
users: {
  Row: {
    id: string
    email: string
    nama: string | null        // ← Changed to nullable
    username: string | null    // ← Changed to nullable
    nik: string | null         // ← Already nullable
    // ... other fields
  }
  Insert: {
    id?: string
    email: string
    nama?: string | null       // ← Changed to optional
    username?: string | null   // ← Changed to optional
    nik?: string | null
    // ... other fields
  }
}
```

## 💻 Cara Pakai di Aplikasi

### 1. Buat User via Supabase Auth (Admin)

```typescript
// Di admin panel atau API route
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, serviceRoleKey) // Service role!

// Buat user dengan email saja
const { data, error } = await supabase.auth.admin.createUser({
  email: 'user@example.com',
  password: 'temporary123',
  email_confirm: true
})

if (data.user) {
  console.log('User created in auth.users:', data.user.id)
  // public.users entry TIDAK otomatis dibuat
}
```

### 2. User Login Pertama Kali

```typescript
// User login dengan email & password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'temporary123'
})

if (data.user) {
  // Cek apakah data di public.users sudah ada
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  if (!profile) {
    // Redirect ke form lengkapi data
    router.push('/onboarding/complete-profile')
  } else if (!profile.nama || !profile.username || !profile.nik) {
    // Data belum lengkap
    router.push('/onboarding/complete-profile')
  } else {
    // Data sudah lengkap
    router.push('/dashboard')
  }
}
```

### 3. Form Lengkapi Data

```typescript
// Di halaman /onboarding/complete-profile
async function completeProfile(formData: {
  nama: string
  username: string
  nik: string
  jabatan?: string
  departemen?: string
}) {
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) return
  
  // Cek apakah entry sudah ada
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.data.user.id)
    .single()
  
  if (existing) {
    // UPDATE existing entry
    const { error } = await supabase
      .from('users')
      .update({
        nama: formData.nama,
        username: formData.username,
        nik: formData.nik,
        jabatan: formData.jabatan,
        departemen: formData.departemen,
        is_active: true
      })
      .eq('id', user.data.user.id)
    
    if (error) throw error
  } else {
    // INSERT new entry
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.data.user.id,
        email: user.data.user.email!,
        nama: formData.nama,
        username: formData.username,
        nik: formData.nik,
        jabatan: formData.jabatan,
        departemen: formData.departemen,
        role: 'user',
        is_active: true
      })
    
    if (error) throw error
  }
  
  router.push('/dashboard')
}
```

### 4. Middleware untuk Cek Data Lengkap

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Cek data di public.users
    const { data: profile } = await supabase
      .from('users')
      .select('nama, username, nik, is_active')
      .eq('id', user.id)
      .single()
    
    const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')
    const needsOnboarding = !profile || !profile.nama || !profile.username || !profile.nik
    
    if (needsOnboarding && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/onboarding/complete-profile', request.url))
    }
    
    if (!needsOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return response
}
```

## 📊 Database Schema After Migration

```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,           -- REQUIRED
  nama VARCHAR(255),                     -- OPTIONAL (nullable)
  username VARCHAR(100),                 -- OPTIONAL (nullable, unique when not null)
  nik VARCHAR(50),                       -- OPTIONAL (nullable, unique when not null)
  jabatan VARCHAR(100),
  departemen VARCHAR(100),
  no_hp VARCHAR(50),
  role user_role DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  signature_image TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraints (allow NULL)
CREATE UNIQUE INDEX users_username_key ON public.users(username) WHERE username IS NOT NULL;
CREATE UNIQUE INDEX users_nik_key ON public.users(nik) WHERE nik IS NOT NULL;
```

## ✅ Keuntungan Approach Ini

1. **Fleksibel**: Admin bisa buat user dulu, data diisi kemudian
2. **User Experience**: User bisa langsung login, lalu lengkapi profil
3. **No Errors**: Tidak ada constraint error saat buat user
4. **Gradual Onboarding**: Bisa minta data bertahap
5. **Validation**: Bisa validasi username/nik uniqueness di form

## 🔍 Troubleshooting

### Problem: Unique constraint error saat isi username/nik

**Penyebab:** Username atau NIK sudah dipakai user lain

**Solusi:**
```typescript
// Cek availability sebelum submit
async function checkUsernameAvailable(username: string, currentUserId: string) {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .neq('id', currentUserId)
    .single()
  
  return !data // true jika available
}
```

### Problem: User bisa akses app tanpa lengkapi data

**Solusi:** Gunakan middleware (lihat contoh di atas)

### Problem: RLS policy block insert/update

**Solusi:**
```sql
-- Policy untuk user update profil sendiri
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy untuk user insert profil sendiri (first time)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

## 🎯 Summary

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Buat user | Harus lengkap semua data | Email saja cukup |
| Entry di public.users | Otomatis (bisa error) | Manual/menyusul |
| Constraint | nama, username, nik required | Hanya email required |
| Onboarding | Langsung aktif | Bisa gradual |
| Error handling | Kompleks | Simpel |

Sekarang Anda bisa buat user dengan email dulu, data menyusul! 🚀
