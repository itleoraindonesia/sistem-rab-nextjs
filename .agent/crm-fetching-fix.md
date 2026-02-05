# Fix CRM Data Fetching Issue

## Problem
Data tidak muncul ketika kembali ke halaman CRM setelah navigasi ke halaman lain. Halaman stuck di "Loading dashboard...".

## Root Cause
Konflik antara konfigurasi global React Query dan konfigurasi spesifik komponen:
- Global config: `refetchOnMount: false` (terlalu agresif caching)
- Komponen config: `refetchOnMount: true` (ingin data fresh)
- Global config override komponen config, menyebabkan data tidak di-refetch

## Solution Applied
Updated global caching strategy di `QueryProvider.tsx`:

### Before:
```typescript
staleTime: 5 * 60 * 1000,        // 5 minutes
refetchOnWindowFocus: false,     // ❌ Disabled
refetchOnMount: false,           // ❌ Disabled
```

### After:
```typescript
staleTime: 2 * 60 * 1000,        // 2 minutes (lebih fresh)
refetchOnWindowFocus: true,      // ✅ Enabled
refetchOnMount: true,            // ✅ Enabled
```

## Behavior Changes

### Sebelum Fix:
1. Masuk halaman CRM pertama kali → ✅ Data fetch
2. Pindah ke halaman lain → Data di-cache
3. Balik ke halaman CRM → ❌ Stuck "Loading..." (tidak refetch)

### Setelah Fix:
1. Masuk halaman CRM pertama kali → ✅ Data fetch
2. Pindah ke halaman lain → Data di-cache (2 menit)
3. Balik ke halaman CRM:
   - Jika < 2 menit → ✅ Langsung tampil dari cache (instant)
   - Jika > 2 menit → ✅ Refetch data baru (fresh)

## Smart Caching Strategy

| Component | staleTime | Behavior |
|-----------|-----------|----------|
| **Global Default** | 2 minutes | Baseline untuk semua query |
| **CRM Dashboard** | 3 minutes | Stats tidak perlu terlalu sering update |
| **Clients Table** | 1 minute | Table data perlu lebih fresh |

### Keuntungan:
- ✅ Data selalu fresh saat navigasi
- ✅ Tidak terlalu banyak request (masih ada caching)
- ✅ UX lebih baik (no stuck loading)
- ✅ Auto-refresh setiap 5 menit untuk dashboard

## Files Modified
1. `src/components/QueryProvider.tsx` - Global config
2. `src/components/crm/CRMDashboard.tsx` - Simplified config
3. `src/components/crm/ClientsTable.tsx` - Simplified config

## Testing
Silakan test dengan:
1. Masuk ke halaman CRM Dashboard
2. Pindah ke halaman lain (misal: Meeting)
3. Balik ke CRM Dashboard
4. Data harus muncul (tidak stuck loading)

---
**Date:** 2026-02-04
**Issue:** CRM data fetching after navigation
**Status:** ✅ Fixed
