'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { UserProfile, fetchUserProfile } from '@/lib/permissions'
import { supabase } from '@/lib/supabase/client'

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
}

export function useUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        return null
      }

      const profile = await fetchUserProfile(session.user.id)

      if (!profile) {
        return null
      }

      return profile
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
