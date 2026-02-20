'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { User } from '@/lib/permissions'
import { supabase } from '@/lib/supabase/client'

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

export function useUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async (): Promise<User | null> => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        return null
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        throw new Error(error.message || 'Failed to fetch user profile')
      }

      return userData as User
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function useAuthListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          queryClient.invalidateQueries({ queryKey: userKeys.current() })
        } else if (event === 'SIGNED_OUT') {
          queryClient.setQueryData(userKeys.current(), null)
          queryClient.invalidateQueries({ queryKey: userKeys.all })
        } else if (event === 'TOKEN_REFRESHED') {
          // Session refreshed, no need to refetch user data
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [queryClient])
}

export function useLogout() {
  const queryClient = useQueryClient()

  return async () => {
    await supabase.auth.signOut()
    queryClient.clear()
  }
}
