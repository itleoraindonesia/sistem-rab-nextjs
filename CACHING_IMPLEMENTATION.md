# TanStack Query Caching Implementation

## Overview
Implementasi caching menggunakan TanStack Query (React Query) untuk meningkatkan performa dan UX pada modul CRM.

## Perubahan yang Dilakukan

### 1. Supabase Client Configuration (`src/lib/supabase/client.ts`)
**Masalah:** Timeout 30 detik yang sering terjadi karena koneksi lambat atau hanging requests.

**Solusi:**
- Menambahkan custom `fetchWithTimeout` dengan timeout 10 detik
- Menggunakan `AbortController` untuk membatalkan request yang terlalu lama
- Konfigurasi auth untuk auto-refresh token dan persist session

```typescript
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = 10000; // 10 seconds
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id));
};
```

### 2. Query Provider Setup (`src/components/QueryProvider.tsx`)
**Konfigurasi Global:**
- `staleTime: 60 * 1000` - Data dianggap fresh selama 1 menit
- `gcTime: 5 * 60 * 1000` - Data disimpan di memory selama 5 menit setelah tidak digunakan
- `retry: 2` - Retry otomatis 2x jika gagal
- `retryDelay: exponential backoff` - Delay antar retry meningkat secara eksponensial
- `refetchOnWindowFocus: true` - Auto-refresh saat user kembali ke tab
- `refetchOnReconnect: true` - Auto-refresh saat internet kembali
- `networkMode: 'online'` - Hanya jalankan query saat online

### 3. CRM Dashboard (`src/components/crm/CRMDashboard.tsx`)
**Perubahan:**
- ❌ Hapus manual `useEffect`, `useState` untuk loading/error
- ❌ Hapus manual timeout race condition (30 detik)
- ❌ Hapus visibility change listener manual
- ✅ Gunakan `useQuery` hook
- ✅ Error handling yang lebih baik (AbortError, Network Error)
- ✅ Retry otomatis dengan exponential backoff

**Query Key:**
```typescript
queryKey: ['crm-stats']
```

### 4. Clients Table (`src/components/crm/ClientsTable.tsx`)
**Perubahan:**
- ❌ Hapus manual state management
- ❌ Hapus manual timeout race condition
- ❌ Hapus visibility change listener
- ✅ Gunakan `useQuery` dengan dependencies
- ✅ Smart caching berdasarkan filter/search/pagination

**Query Key:**
```typescript
queryKey: ['clients', page, debouncedSearch, filterKebutuhan, sortBy, sortOrder]
```

### 5. Cache Invalidation
**Lokasi yang melakukan invalidation:**

#### a. Edit Client Modal (`src/app/(protected)/crm/clients/page.tsx`)
```typescript
const handleEditSuccess = () => {
  queryClient.invalidateQueries({ queryKey: ['clients'] });
  queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
};
```

#### b. Bulk Input Form (`src/components/crm/BulkInputForm.tsx`)
```typescript
// Setelah berhasil input data
queryClient.invalidateQueries({ queryKey: ['clients'] });
queryClient.invalidateQueries({ queryKey: ['crm-stats'] });
```

## Manfaat

### 1. **Performa Lebih Cepat**
- Data muncul instant dari cache saat navigasi
- Tidak ada loading spinner berulang untuk data yang sama
- Background refetch tidak mengganggu UI

### 2. **Hemat API Calls**
- Request ke Supabase berkurang drastis
- Data di-reuse selama masih fresh (1 menit)
- Automatic deduplication untuk request yang sama

### 3. **UX Lebih Baik**
- Tidak ada "kedap-kedip" loading
- Auto-refresh saat kembali ke tab
- Auto-refresh saat internet kembali
- Error handling yang lebih informatif

### 4. **Timeout Handling**
- Timeout dikurangi dari 30 detik → 10 detik
- Retry otomatis dengan exponential backoff
- Error message yang lebih jelas (timeout vs network error)

### 5. **Developer Experience**
- Kode lebih bersih (~100 baris berkurang per component)
- Built-in DevTools untuk debugging
- Type-safe dengan TypeScript

## Error Messages

### Sebelum:
```
Error: Query timeout after 30 seconds - check Supabase connection
```

### Sesudah:
```
Error: Request timeout - server took too long to respond
Error: Network error - please check your internet connection
Error: Database error: [specific error from Supabase]
```

## Testing

### Manual Testing Checklist:
- [ ] Dashboard loads tanpa timeout
- [ ] Clients table loads dengan pagination
- [ ] Search/filter bekerja dengan caching
- [ ] Edit client → dashboard auto-refresh
- [ ] Bulk input → table auto-refresh
- [ ] Pindah tab → auto-refresh saat kembali
- [ ] Disconnect internet → error message yang jelas
- [ ] Reconnect internet → auto-retry

## Monitoring

### TanStack Query DevTools
DevTools tersedia di development mode (floating button di pojok kanan bawah):
- Lihat semua queries yang active
- Lihat status cache (fresh, stale, fetching)
- Lihat query keys dan data
- Manual invalidate/refetch untuk testing

## Troubleshooting

### Jika masih ada timeout:
1. Cek koneksi internet
2. Cek Supabase dashboard untuk status service
3. Lihat browser console untuk error detail
4. Cek Network tab di DevTools untuk request yang lambat
5. Pertimbangkan untuk menambah timeout di `fetchWithTimeout` (max 15 detik)

### Jika data tidak update:
1. Pastikan `invalidateQueries` dipanggil setelah mutation
2. Cek query key match dengan yang di-invalidate
3. Lihat TanStack DevTools untuk status cache

## Future Improvements

### Optimistic Updates
Untuk UX yang lebih responsif, bisa implementasi optimistic updates:
```typescript
const mutation = useMutation({
  mutationFn: updateClient,
  onMutate: async (newData) => {
    // Update UI immediately
    queryClient.setQueryData(['clients'], (old) => {
      // Update logic
    });
  },
  onError: (err, newData, context) => {
    // Rollback on error
  },
});
```

### Prefetching
Untuk halaman yang sering dikunjungi:
```typescript
queryClient.prefetchQuery({
  queryKey: ['crm-stats'],
  queryFn: fetchStats,
});
```

### Infinite Queries
Untuk pagination yang lebih smooth:
```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['clients'],
  queryFn: ({ pageParam = 1 }) => fetchClients(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

## References
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Client Docs](https://supabase.com/docs/reference/javascript/introduction)
