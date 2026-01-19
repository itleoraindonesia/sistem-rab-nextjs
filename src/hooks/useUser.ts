import { useState, useEffect } from 'react'
import { User } from '@/lib/permissions'
import { supabase } from '@/lib/supabase/client'

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Fetch user profile from public.users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (userData && !error) {
            setUser(userData)
          } else {
            console.error('Error fetching user profile:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in useUser:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setUser(userData || null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return user
}

// Hook for loading state
export function useUserLoading(): boolean {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setLoading(false)
    }

    checkAuth()
  }, [])

  return loading
}
