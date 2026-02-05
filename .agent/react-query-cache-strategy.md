# React Query Cache Strategy - Final Configuration

**Date:** 2026-02-04  
**Updated:** Optimized for 1-minute freshness

---

## 📊 StaleTime Configuration

### Global Default (`QueryProvider.tsx`)
```typescript
staleTime: 1 * 60 * 1000  // 1 minute
```
**Applies to:** All queries by default

### CRM Dashboard (`CRMDashboard.tsx`)
```typescript
staleTime: 2 * 60 * 1000  // 2 minutes
```
**Reason:** Dashboard stats don't need to be as fresh as table data

### Clients Table (`ClientsTable.tsx`)
```typescript
staleTime: 1 * 60 * 1000  // 1 minute (uses global)
```
**Reason:** Table data should be fresh for accurate client info

---

## 🎯 Behavior Matrix

| Scenario | Time Since Last Fetch | Behavior |
|----------|----------------------|----------|
| **Navigate to CRM** | < 1 min | ✅ Instant (from cache) |
| **Navigate to CRM** | > 1 min | 🔄 Refetch (data stale) |
| **Switch browser tab** | < 1 min | ✅ No refetch |
| **Switch browser tab** | > 1 min | 🔄 Auto-refetch on focus |
| **Dashboard stats** | < 2 min | ✅ Instant (from cache) |
| **Dashboard stats** | > 2 min | 🔄 Refetch (data stale) |

---

## ⚡ Performance Impact

### Before (5 min staleTime):
- ❌ Data too old
- ❌ Users see outdated info
- ✅ Less server requests

### After (1 min staleTime):
- ✅ Fresh data
- ✅ Better user experience
- ⚠️ Slightly more requests (acceptable)

### Request Frequency Estimate:
- **Active user (switching pages):** ~1 request/min
- **Idle user:** Auto-refresh every 5 min (dashboard only)
- **Total impact:** Minimal, acceptable for CRM use case

---

## 🔄 Auto-Refresh Strategy

### Dashboard Only:
```typescript
refetchInterval: 5 * 60 * 1000  // Every 5 minutes
refetchIntervalInBackground: false
```

**Why:**
- Dashboard shows overview stats
- Auto-refresh keeps it current
- Only when window is focused (saves resources)

### Table:
- No auto-refresh interval
- Only refetch on:
  - User navigation (if stale)
  - Window focus (if stale)
  - Manual filter/search/pagination

---

## 💾 Garbage Collection

```typescript
gcTime: 10 * 60 * 1000  // 10 minutes
```

**Meaning:**
- Unused cached data kept for 10 minutes
- After 10 min of no usage → removed from memory
- Prevents memory bloat

---

## 🎨 User Experience

### Scenario 1: Quick Navigation
```
User: CRM → Meeting → CRM (within 1 min)
Result: ✅ Instant load from cache
```

### Scenario 2: Longer Navigation
```
User: CRM → Meeting → (2 min) → CRM
Result: 🔄 Quick refetch (data was stale)
       ✅ Shows cached data while refetching
       ✅ Smooth transition
```

### Scenario 3: Multitasking
```
User: Opens CRM → Switches to email tab → (2 min) → Back to CRM
Result: 🔄 Auto-refetch on focus
       ✅ Always fresh data
```

---

## 📈 Recommended Values by Use Case

| Use Case | Recommended staleTime | Reason |
|----------|----------------------|---------|
| **Real-time data** | 30 seconds | Stock prices, live chat |
| **CRM/Business data** | **1 minute** ✅ | Current config |
| **Static content** | 5-10 minutes | Blog posts, docs |
| **Rarely changing** | 30+ minutes | Settings, configs |

---

## ✅ Current Setup Summary

```typescript
Global:           1 minute  ← Most queries
CRM Dashboard:    2 minutes ← Stats overview
Clients Table:    1 minute  ← Client data
```

**Balance achieved:**
- ✅ Fresh enough for business use
- ✅ Good performance (cache hits)
- ✅ Reasonable server load
- ✅ Excellent UX

---

**Conclusion:** 1-minute staleTime is optimal for CRM use case! 🎉
