# React Query - Always Fresh Data Strategy

**Date:** 2026-02-04  
**Strategy:** Always fetch fresh data, no caching delay

---

## ⚡ Configuration

### Global Setting
**File:** `src/components/QueryProvider.tsx`

```typescript
staleTime: 0                    // Data ALWAYS stale = ALWAYS refetch
gcTime: 5 * 60 * 1000          // Keep in cache for 5 minutes (for back button)
refetchOnMount: true            // Always refetch on mount
refetchOnWindowFocus: true      // Always refetch on window focus
```

---

## 🎯 Behavior

### Every Navigation:
```
User: Page A → Page B → Page A
       ↓        ↓        ↓
     Fetch    Fetch    Fetch (ALWAYS FRESH!)
```

### Every Refresh:
```
User: Refresh page (F5)
       ↓
     Fetch (ALWAYS FRESH!)
```

### Window Focus:
```
User: Switch tab → Back to app
       ↓
     Fetch (ALWAYS FRESH!)
```

---

## 📊 Component Configuration

All components now use global config (staleTime: 0):

| Component | staleTime | placeholderData | Auto-refresh |
|-----------|-----------|-----------------|--------------|
| **CRM Dashboard** | 0 (global) | ✅ Yes | Every 5 min |
| **Clients Table** | 0 (global) | ✅ Yes | No |
| **Meeting List** | 0 (global) | ✅ Yes | No |
| **Meeting Detail** | 0 (global) | ✅ Yes | No |

---

## ✅ Benefits

1. **Always Fresh** - Data never stale, always up-to-date
2. **Simple** - No complex caching logic
3. **Predictable** - Always fetch on navigation
4. **No Stuck Loading** - `placeholderData` shows old data while fetching

---

## ⚠️ Trade-offs

### Pros:
- ✅ Always fresh data
- ✅ No cache confusion
- ✅ Simple to understand

### Cons:
- ❌ More network requests
- ❌ Slightly slower navigation (but mitigated by placeholderData)
- ❌ Higher server load

---

## 🎨 User Experience

### Navigation Flow:
```
1. User clicks link
2. Old data shows INSTANTLY (placeholderData)
3. New data fetches in background
4. UI updates smoothly when ready
```

**Result:** Fast perceived performance + always fresh data! 🚀

---

## 💾 Cache Strategy

```typescript
staleTime: 0          // Immediately stale
gcTime: 5 minutes     // Keep for 5 min (for back button)
```

**Why gcTime: 5 min?**
- Browser back button still instant (< 5 min)
- Not too much memory usage
- Good balance

---

## 🧪 Testing

### Test 1: Navigation
```
CRM → Meeting → CRM
Expected: Each navigation fetches fresh data
```

### Test 2: Refresh
```
F5 on any page
Expected: Fresh data loaded
```

### Test 3: Long Stay
```
Stay on page > 5 min → Navigate
Expected: Fresh data (no stuck loading)
```

---

## 📝 Summary

**Old Strategy:**
- staleTime: 1-2 minutes
- Cache for 30 minutes
- Complex logic

**New Strategy:**
- staleTime: 0 (always fresh)
- Cache for 5 minutes (back button only)
- Simple & predictable

**Result:** Always fresh data with smooth UX! ✅

---

**No restart needed** - Just refresh browser (Ctrl + Shift + R)
