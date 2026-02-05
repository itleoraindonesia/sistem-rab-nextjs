# Debug: CRM Loading Issue Analysis

**Issue:** Stuck loading ketika balik dari halaman Meeting setelah > 3 menit

---

## 🔍 Testing Instructions

### Step 1: Open Browser Console
1. Buka Chrome DevTools (F12)
2. Go to Console tab
3. Clear console (Ctrl+L)

### Step 2: Reproduce Issue
1. **T=0:** Buka halaman CRM (Dashboard atau Clients)
   - Check console log: `[CRMDashboard] Query State:` atau `[ClientsTable] Query State:`
   - Note the values

2. **T=1 min:** Pindah ke halaman Meeting
   - Stay di sana selama **3-4 menit**

3. **T=4 min:** Balik ke halaman CRM
   - **IMMEDIATELY check console log!**
   - Look for the query state

### Step 3: Analyze Console Output

Expected console log format:
```javascript
[ClientsTable] Query State: {
  hasData: true/false,      // ← Apakah ada data di cache?
  isLoading: true/false,    // ← Apakah sedang loading?
  isFetching: true/false,   // ← Apakah sedang fetch?
  clientsCount: 20,         // ← Berapa banyak data?
  totalCount: 100,          // ← Total dari server?
  queryKey: [...]           // ← Query key yang digunakan
}
```

---

## 📊 Possible Scenarios

### Scenario A: Data Ada, Tapi Stuck Loading ❌
```javascript
{
  hasData: true,
  isLoading: true,
  isFetching: true,
  clientsCount: 0,      // ← MASALAH: Data kosong!
  totalCount: 0
}
```
**Diagnosis:** Cache corrupted atau query gagal
**Fix:** Clear cache atau fix query

### Scenario B: Data Hilang dari Cache ❌
```javascript
{
  hasData: false,         // ← MASALAH: Data hilang!
  isLoading: true,
  isFetching: true,
  clientsCount: 0,
  totalCount: 0
}
```
**Diagnosis:** gcTime terlalu pendek atau cache di-clear
**Fix:** Increase gcTime atau fix cache strategy

### Scenario C: Query Key Berubah ❌
```javascript
// First visit:
queryKey: ['clients', 1, '', '', 'created_at', 'desc']

// After return:
queryKey: ['clients', 1, 'search', '', 'created_at', 'desc']
//                         ^^^^^^ BEDA!
```
**Diagnosis:** State reset causing query key mismatch
**Fix:** Persist state atau use URL params

### Scenario D: Normal Behavior ✅
```javascript
{
  hasData: true,          // ✅ Ada cache
  isLoading: false,       // ✅ Tidak loading
  isFetching: true,       // ✅ Background refetch
  clientsCount: 20,       // ✅ Ada data
  totalCount: 100
}
```
**Result:** UI shows cached data while refetching in background

---

## 🎯 What to Look For

1. **hasData value**
   - `true` → Cache working
   - `false` → Cache missing (problem!)

2. **isLoading vs isFetching**
   - `isLoading: true, isFetching: true` → Initial load
   - `isLoading: false, isFetching: true` → Background refetch (good!)
   - `isLoading: true, isFetching: false` → Weird state (problem!)

3. **clientsCount**
   - `> 0` → Data available
   - `= 0` → No data (check if expected or bug)

4. **queryKey consistency**
   - Should be same before and after navigation
   - If different → state management issue

---

## 🔧 Quick Fixes to Try

### Fix 1: Increase gcTime
```typescript
// QueryProvider.tsx
gcTime: 30 * 60 * 1000  // 30 minutes instead of 10
```

### Fix 2: Add keepPreviousData
```typescript
// ClientsTable.tsx
const { data, isLoading } = useQuery({
  queryKey: ['clients', ...],
  queryFn: fetchClients,
  keepPreviousData: true,  // ← Add this
})
```

### Fix 3: Persist State in URL
```typescript
// Use URL search params instead of useState
const [searchParams, setSearchParams] = useSearchParams();
const page = searchParams.get('page') || '1';
```

---

## 📝 Report Format

Please share the console output in this format:

```
BEFORE leaving CRM:
[ClientsTable] Query State: { ... }

AFTER returning to CRM (after 3+ min):
[ClientsTable] Query State: { ... }

Observed behavior:
- [ ] Stuck on "Loading..."
- [ ] Shows empty table
- [ ] Shows cached data
- [ ] Shows fresh data
```

---

**Next Steps:** Run the test and share the console output!
