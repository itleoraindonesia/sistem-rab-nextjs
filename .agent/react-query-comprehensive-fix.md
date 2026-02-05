# 📄 **Settingan: Supabase + Next.js + TanStack Query**

---

## **TanStack Query Client**

```typescript
staleTime: 0
cacheTime: 10 * 60 * 1000
refetchOnMount: true
refetchOnWindowFocus: true
refetchInterval: 10 * 60 * 1000
keepPreviousData: true
placeholderData: keepPreviousData
retry: 3
networkMode: 'always'
```

---

## **Cache Invalidation**

- Create client → invalidate `['clients']`
- Update client → invalidate `['clients']`
- Delete client → invalidate `['clients']`
- Manual refresh → refetch `['clients']`

---

## **First Load Behavior**

1. Tampilkan cache (jika ada)
2. Background refresh otomatis
3. Update UI saat data baru siap

---

## **Navigate Behavior**

1. Tampilkan cached data langsung
2. Tidak ada loading spinner
3. Background refresh jika stale