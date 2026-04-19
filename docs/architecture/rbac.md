# Role-Based Access Control (RBAC) Analysis

## Konteks Perusahaan

Sistem Leora ERP dibangun untuk **PT Maju Mandiri Gemilang Terang** dan **PT Leora Konstruksi Indonesia**. Bisnis utama bergerak di bidang **konstruksi** dengan produk-produk seperti Panel Beton, Pagar Beton, Sandwich Panel, Panel Surya, U-Ditch, Jasa Konstruksi, dan Jasa Renovasi.

Modul yang sudah ada dalam sistem:
- **Dashboard** — overview operasional
- **Dokumen Surat Keluar** — workflow draft → submit → review → approve
- **CRM** — pipeline penjualan (IG Lead → WA Negotiation → Quotation → Invoice Deal → WIP → Finish)
- **Produk & RAB** — kalkulator RAB, master panel, master ongkir
- **Meeting (MoM)** — notulen rapat internal & eksternal
- **Master Data** — instansi, document types, workflow stages
- **File Manager** — storage dokumen
- **Konstruksi** — project tracking (baru dimulai)
- **Supply Chain** — planned, belum implement

Rencana ke depan: sistem akan terkoneksi dengan **vendor** (supplier material, subcontractor) dan **client** (pemilik proyek) secara langsung.

## Arsitektur RBAC Saat Ini

### Database Layer

#### Tabel Users
```sql
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  nik             VARCHAR UNIQUE,
  username        VARCHAR UNIQUE,
  email           VARCHAR UNIQUE,
  nama            VARCHAR NOT NULL,
  jabatan         VARCHAR,              -- free text
  departemen      VARCHAR,              -- free text, no FK
  no_hp           VARCHAR,
  role            user_role DEFAULT 'user',  -- ENUM column
  is_active       BOOLEAN DEFAULT true,
  avatar_url      TEXT,
  signature_image TEXT,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ
);
```

#### Enum Role
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'reviewer', 'approver', 'user');
```

#### Relasi ke tabel lain
- Tidak ada tabel `roles` — role disimpan sebagai ENUM di kolom `users.role`
- Tidak ada tabel `permissions` — permission matrix hardcoded di TypeScript
- Tidak ada tabel `departments` — departemen sebagai VARCHAR bebas di `users.departemen`
- Tidak ada junction table — 1 user = 1 role (single value)

### RLS Layer

Setelah beberapa iterasi fix (migration 005 → 006 → 008), RLS disederhanakan menjadi **auth-only**:

| Tabel | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `users` | authenticated (active only) | denied | own profile only | denied |
| `instansi` | authenticated | authenticated | authenticated | authenticated |
| `document_types` | authenticated | authenticated | authenticated | authenticated |
| `document_workflow_stages` | authenticated | authenticated | authenticated | authenticated |
| `master_panel` | anon + authenticated | authenticated | authenticated | authenticated |
| `master_ongkir` | anon + authenticated | authenticated | authenticated | authenticated |
| `outgoing_letters` | authenticated | authenticated (ownership) | own DRAFT only | own DRAFT only |
| `letter_histories` | authenticated | authenticated (ownership) | denied | denied |
| `clients` | authenticated | authenticated | authenticated | authenticated |
| `mom_meetings` | authenticated | authenticated (ownership) | own meetings | authenticated |
| `rab_documents` | authenticated | authenticated | authenticated | authenticated |

Helper functions `is_admin()`, `is_manager()`, `is_admin_or_manager()`, `has_crm_manage()` sudah **di-drop** di migration 006/008 karena menyebabkan infinite recursion pada tabel `users`.

### Frontend Layer

#### Permission System (`src/lib/permissions.ts`)
Permission matrix hardcoded di TypeScript:

```typescript
PERMISSION_MATRIX = {
  admin: SEMUA_PERMISSION,                    // 26 permissions
  manager: {
    Corsec:      [dashboard, meeting, files],
    Finance:     [dashboard, dokumen, produk, master, meeting, files],
    Human Capital: [dashboard, dokumen, meeting, files],
    Konstruksi:  [dashboard, dokumen, produk, crm, master, meeting, files, konstruksi],
    Marketing:   [dashboard, crm, meeting, files, konstruksi.view],
    PBD:         SEMUA_PERMISSION,             // full access
    SCM:         [dashboard, supply-chain, meeting, files],
  },
  reviewer: [dashboard, dokumen.create, submit, review, konstruksi.view],
  approver: [dashboard, dokumen.create, submit, approve, konstruksi.view],
  user:     [dashboard, dokumen.create.own, submit, produk.view, crm.view, konstruksi.view],
}
```

Departemen untuk manager dicek dengan **string exact match** (case-sensitive):

```typescript
// permissions.ts:170
const deptPermissions = PERMISSION_MATRIX.manager[user.departemen as Department]
// Jika departemen = 'finance' (lowercase) → undefined → 0 permissions
```

#### Components
| File | Fungsi |
|------|--------|
| `src/hooks/useUser.ts` | Fetch user profile dari Supabase, cache via TanStack Query |
| `src/hooks/usePermissions.ts` | Wrapper hook: `hasPermission()`, `canAccess()`, `canAccessMenu()` |
| `src/components/auth/PermissionGuard.tsx` | `<PermissionGuard>`, `<HasPermission>`, `<RoleGuard>`, `<DepartmentGuard>` |
| `src/lib/auth/routeGuard.ts` | Server-side guards: `requirePermission()`, `requireRole()`, `requireDepartment()` |

#### Middleware (`src/lib/supabase/middleware.ts`)
Hanya melakukan:
- Refresh session token
- Redirect ke `/login` jika tidak authenticated
- **Tidak ada check role atau permission**

#### Route Guard (`src/lib/auth/routeGuard.ts`)
Setiap guard function melakukan 2 query:
1. `supabase.auth.getUser()` — verifikasi session
2. `supabase.from('users').select('*')` — fetch profile + role

Kemudian check permission di TypeScript menggunakan hardcoded matrix.

## Daftar Masalah

### 1. Security — RLS Auth-Only
**Severity: CRITICAL**

Semua tabel menggunakan `USING (true)` untuk authenticated users. Tidak ada filter berdasarkan role atau permission di database level. Security bergantung sepenuhnya pada frontend.

```sql
-- Contoh: semua authenticated user bisa edit master data
CREATE POLICY "auth_instansi_write" ON instansi
FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

Siapa saja yang punya anon key bisa akses data langsung via Supabase API tanpa melalui frontend.

### 2. Permissions Hardcoded
**Severity: HIGH**

Permission matrix ada di file TypeScript. Tambah role, ubah permission, atau tambah module baru memerlukan code change dan deploy.

### 3. Single Role per User
**Severity: MEDIUM**

User hanya bisa punya 1 role dari enum. Tidak bisa: manager yang juga perlu jadi reviewer, atau user biasa yang diberi akses approve untuk proyek tertentu.

### 4. Departemen Free-Text
**Severity: MEDIUM**

Departemen disimpan sebagai VARCHAR tanpa constraint. Tidak ada validasi, case-sensitive match di frontend, tidak bisa list secara konsisten.

### 5. Middleware Tidak Check Permission
**Severity: HIGH**

Route `/settings/workflow` bisa diakses oleh semua authenticated user, bukan hanya yang punya permission `workflow.manage`. Middleware hanya redirect ke login.

### 6. RLS pada Tabel Users Tidak Pakai Optimasi
**Severity: LOW**

Policy tidak menggunakan `(select auth.uid())` untuk caching. Pada tabel dengan data besar, `auth.uid()` bisa dipanggil per-row.

### 7. Route Guard N+1 Query
**Severity: LOW**

Setiap guard function (`requirePermission`, `requireRole`, `requireDepartment`) melakukan query ulang ke `users` table. Tidak ada shared cache antar guards dalam satu request.

### 8. Tidak Siap untuk Vendor/Client
**Severity: HIGH (masa depan)**

Tidak ada konsep stakeholder type. Tidak ada cara untuk: vendor yang hanya bisa lihat PO terkait dirinya, atau client yang hanya bisa lihat proyek miliknya. Arsitektur saat ini hanya untuk internal users.

## Ringkasan Komponen

| Komponen | File | Status |
|----------|------|--------|
| DB Schema (users) | Migration 004 | Ada, tapi single-role ENUM |
| DB Schema (roles/permissions) | — | Tidak ada |
| DB Schema (departments) | — | Tidak ada (VARCHAR) |
| RLS Policies | Migration 006, 008 | Auth-only, tidak ada role check |
| Permission Matrix | `src/lib/permissions.ts` | Hardcoded di TypeScript |
| Permission Hook | `src/hooks/usePermissions.ts` | Ada, baca dari hardcoded matrix |
| Permission Components | `src/components/auth/PermissionGuard.tsx` | Ada |
| Route Guards | `src/lib/auth/routeGuard.ts` | Ada, tapi N+1 query |
| Middleware | `src/lib/supabase/middleware.ts` | Auth check only, no permission |
| JWT Claims | — | Tidak ada (tidak role/permissions) |
| Admin UI (manage roles) | — | Tidak ada |

## Rekomendasi Perbaikan

### Prioritas Tinggi
1. **Implementasi RLS berbasis role** untuk data sensitif
2. **JWT claims injection** untuk cache role di frontend
3. **Permission matrix** pindah ke database
4. **Middleware permission check** untuk critical routes

### Prioritas Menengah
1. **Multi-role support** dengan junction table
2. **Department enum** dengan foreign key
3. **Route guard caching** untuk performance
4. **Audit logging** untuk permission changes

### Persiapan Vendor/Client
1. **Stakeholder types** (internal, vendor, client)
2. **Organization-based access** (multi-tenant)
3. **API key management** untuk external integrations

---

*Last Updated: 2026-04-04*
*Status: Current State Analysis*