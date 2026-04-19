# Caching Architecture

## Overview
Sistem menggunakan **TanStack Query (React Query)** untuk caching data dengan fokus pada performance dan user experience. Query provider dikonfigurasi dengan staleTime, gcTime, dan retry logic yang optimal.

## Query Provider Configuration

### Global Settings
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute - data fresh for 1 min
      gcTime: 5 * 60 * 1000,       // 5 minutes - keep in memory
      retry: 2,                    // Retry failed requests 2x
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,  // Refresh when user returns to tab
      refetchOnReconnect: true,    // Refresh on network reconnect
      networkMode: 'online',       // Only run queries when online
    },
    mutations: {
      retry: 1,                    // Retry mutations 1x
      networkMode: 'online',
    },
  },
})
```

### Module-Specific Overrides
```typescript
// CRM Dashboard - More aggressive refresh
useQuery({
  queryKey: ['crm-stats'],
  staleTime: 45 * 1000,           // 45 seconds
  refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 min
  refetchIntervalInBackground: false,
})

// Client list - Fast updates
useQuery({
  queryKey: ['clients', page, search, filter],
  staleTime: 45 * 1000,           // 45 seconds
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
})
```

## Cache Invalidation Strategy

### Automatic Invalidation
```typescript
// After mutations, invalidate related queries
const createClient = useMutation({
  mutationFn: createClientAPI,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] })
    queryClient.invalidateQueries({ queryKey: ['crm-stats'] })
  },
})
```

### Selective Invalidation
```typescript
// Invalidate specific query patterns
queryClient.invalidateQueries({
  queryKey: ['clients'],
  exact: false,  // Invalidate all client-related queries
})

// Remove specific cached data
queryClient.removeQueries({ queryKey: ['clients', 'detail', clientId] })
```

## Error Handling & Retry

### Network Error Recovery
```typescript
// Automatic retry with exponential backoff
retry: (failureCount, error) => {
  // Retry network errors, timeout, 5xx server errors
  if (isNetworkError(error) || isServerError(error)) {
    return failureCount < 3
  }
  // Don't retry client errors (4xx)
  return false
}
```

### User-Friendly Error Messages
```typescript
// Error state handling
if (error) {
  if (error.code === 'NETWORK_ERROR') {
    return <div>Connection lost. Please check your internet.</div>
  }
  if (error.code === 'TIMEOUT') {
    return <div>Request timeout. Server is busy, please try again.</div>
  }
  return <div>Something went wrong. Please refresh the page.</div>
}
```

## Connection Status Monitoring

### Real-time Connection Detection
```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  const handleOnline = () => setIsOnline(true)
  const handleOffline = () => setIsOnline(false)

  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])
```

### Database Health Check
```typescript
// Periodic health check every 5 minutes
useQuery({
  queryKey: ['db-health'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('count', { count: 'exact', head: true })
    if (error) throw error
    return { healthy: true, timestamp: Date.now() }
  },
  refetchInterval: 5 * 60 * 1000, // Every 5 minutes
  retry: false, // Don't retry health checks
})
```

### Visual Indicators
```typescript
// Connection status component
function ConnectionStatus() {
  const isOnline = useOnlineStatus()
  const { data: health } = useQuery({ queryKey: ['db-health'] })

  if (isOnline && health?.healthy) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`px-3 py-2 rounded-lg text-sm ${
        !isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
      }`}>
        {!isOnline ? 'Offline' : 'Database unreachable'}
      </div>
    </div>
  )
}
```

## Optimistic Updates

### Implementation Pattern
```typescript
const updateClient = useMutation({
  mutationFn: updateClientAPI,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['clients', clientId] })

    // Snapshot previous value
    const previousData = queryClient.getQueryData(['clients', clientId])

    // Optimistically update cache
    queryClient.setQueryData(['clients', clientId], old => ({
      ...old,
      ...newData,
    }))

    // Return rollback function
    return { previousData }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    if (context?.previousData) {
      queryClient.setQueryData(['clients', clientId], context.previousData)
    }
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['clients', clientId] })
  },
})
```

## Performance Monitoring

### Query Performance Tracking
```typescript
// Log slow queries in development
if (process.env.NODE_ENV === 'development') {
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.status === 'success') {
      const duration = Date.now() - event.query.state.dataUpdatedAt
      if (duration > 1000) { // > 1 second
        console.warn(`Slow query: ${event.query.queryKey}`, duration + 'ms')
      }
    }
  })
}
```

### Cache Hit/Miss Ratio
```typescript
// Monitor cache effectiveness
const queryCache = queryClient.getQueryCache()
const queries = queryCache.getAll()

const cacheStats = {
  total: queries.length,
  fresh: queries.filter(q => q.state.isStale === false).length,
  stale: queries.filter(q => q.state.isStale === true).length,
  error: queries.filter(q => q.state.status === 'error').length,
}

console.log('Cache Stats:', cacheStats)
```

## Memory Management

### Garbage Collection
```typescript
// Aggressive cleanup for mobile devices
const gcTime = isMobile ? 2 * 60 * 1000 : 10 * 60 * 1000 // 2 min vs 10 min

// Clear unused queries
queryClient.getQueryCache().clear()

// Remove specific patterns
queryClient.removeQueries({
  queryKey: ['old-feature'],
  exact: false,
})
```

## Development Tools

### TanStack Query DevTools
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <App />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </>
  )
}
```

### Keyboard Shortcuts
- `Alt + Shift + Q` (or `Cmd + Shift + Q` on Mac) - Open DevTools
- View query states, cache data, mutation history
- Manual invalidate/refetch for debugging

## Best Practices

### Query Key Patterns
```typescript
// Consistent patterns
['users']                    // All users
['users', userId]           // Specific user
['users', 'list', filters]  // Filtered list
['projects', projectId, 'clients'] // Nested resources
```

### Cache Key Invalidation
```typescript
// Invalidate related queries after mutations
const invalidateRelated = () => {
  queryClient.invalidateQueries({ queryKey: ['users'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })
  queryClient.invalidateQueries({ queryKey: ['stats'] })
}
```

### Error Boundaries
```typescript
// Wrap components that use queries
<ErrorBoundary fallback={<ErrorFallback />}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

## Migration from Manual State

### Before (Manual)
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetchData().then(setData).catch(setError).finally(() => setLoading(false))
}, [deps])
```

### After (React Query)
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['data', deps],
  queryFn: fetchData,
  staleTime: 60 * 1000,
})
```

## Troubleshooting

### Common Issues

#### Queries not updating
- Check queryKey consistency
- Verify invalidateQueries calls
- Check network tab for actual requests

#### Memory leaks
- Clean up subscriptions in useEffect
- Use proper dependency arrays
- Clear cache on unmount if needed

#### Stale data
- Adjust staleTime appropriately
- Use refetchOnWindowFocus for critical data
- Implement real-time subscriptions for live data

#### Too many requests
- Increase staleTime
- Use placeholderData for initial renders
- Implement debounced search

---

*Last Updated: 2026-04-04*
*Status: Production Optimized*