# Debug React Query Cache Not Working

## Problem
Components always show `isLoading: true` even when data should be cached.

## 📋 Global Configuration
**File:** `src/components/QueryProvider.tsx`

```typescript
staleTime: 1 * 60 * 1000      // 1 menit (data dianggap fresh selama 1 menit)
gcTime: 10 * 60 * 1000        // 10 menit (data disimpan di memory)
refetchOnMount: true          // Refetch jika stale
refetchOnWindowFocus: true    // Refetch saat window focus
retry: 3
networkMode: 'always'
```

## Files
- `src/components/QueryProvider.tsx`
- `src/components/crm/CRMDashboard.tsx`  
- `src/components/crm/ClientsTable.tsx`

## Check For
1. Query key stability (changing on every render?)
2. Undefined/null values in query keys
3. Component re-render loops
4. State initialization issues
5. React Strict Mode double-mounting

## Output Needed
1. Root cause
2. Fixed code for all affected files
3. Debugging logs to verify fix
4. Explanation of what was wrong

Query keys look like:
- `['clients', page, search, filter, sortBy, sortOrder]`
- `['crm-stats']`

Settings: staleTime 1-2min, gcTime 30min, placeholderData enabled.