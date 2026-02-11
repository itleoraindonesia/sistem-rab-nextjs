/**
 * Universal Error Handler for TanStack Query
 * 
 * Provides consistent error handling across all query hooks in the application.
 * Handles AbortError gracefully and provides structured error responses.
 */

import { QueryClient } from '@tanstack/react-query'

export interface QueryError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export interface QueryResult<T> {
  data: T | null
  totalCount?: number
  page?: number
  totalPages?: number
}

/**
 * Universal error handler for TanStack Query
 * Handles common error patterns and provides structured responses
 */
export function handleQueryError(
  error: any, 
  context: string = 'Query'
): QueryError {
  // Handle AbortError (normal cancellation)
  if (error?.message?.includes('AbortError') || error?.message?.includes('aborted')) {
    console.log(`[${context}] Request cancelled (AbortError)`)
    return {
      message: 'Request cancelled',
      code: 'ABORT_ERROR'
    }
  }

  // Handle Supabase errors
  if (error?.code && error?.message) {
    console.error(`[${context}] Supabase Error:`, {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    
    return {
      message: error.message || 'Database query failed',
      code: error.code,
      details: error.details,
      hint: error.hint
    }
  }

  // Handle generic errors
  console.error(`[${context}] Unexpected error:`, error)
  return {
    message: error?.message || 'An unexpected error occurred',
    code: 'UNEXPECTED_ERROR'
  }
}

/**
 * Create a standardized error response for query results
 */
export function createErrorResponse<T>(
  error: QueryError,
  context: string = 'Query'
): QueryResult<T> {
  // For AbortError, return empty data instead of throwing
  if (error.code === 'ABORT_ERROR') {
    return {
      data: null,
      totalCount: 0,
      page: 1,
      totalPages: 0
    }
  }

  // For other errors, throw to trigger error boundaries
  throw new Error(`${context}: ${error.message}`)
}

/**
 * Universal query options for consistent error handling
 */
export const createQueryOptions = <T>(
  context: string = 'Query'
) => ({
  onError: (error: any) => {
    const handledError = handleQueryError(error, context)
    console.error(`[${context}] Query failed:`, handledError)
  },
  // Other default options can be added here
})

/**
 * Utility to check if error is a cancellation error
 */
export function isCancellationError(error: any): boolean {
  return error?.message?.includes('AbortError') || 
         error?.message?.includes('aborted') ||
         error?.code === 'ABORT_ERROR'
}

/**
 * Safe query function wrapper that handles errors consistently
 */
export function createSafeQueryFn<T>(
  queryFn: () => Promise<T>,
  context: string = 'Query'
) {
  return async (): Promise<T> => {
    try {
      return await queryFn()
    } catch (error) {
      const handledError = handleQueryError(error, context)
      throw new Error(`${context}: ${handledError.message}`)
    }
  }
}

/**
 * QueryClient with global error handling
 */
export const createQueryClientWithGlobalErrorHandling = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry on cancellation errors
          if (isCancellationError(error)) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        }
      },
      mutations: {}
    }
  })
}