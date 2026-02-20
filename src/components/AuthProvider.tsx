'use client'

import { ReactNode } from 'react'
import { useAuthListener } from '@/hooks/useUser'

export function AuthProvider({ children }: { children: ReactNode }) {
  useAuthListener()
  return <>{children}</>
}
