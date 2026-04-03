'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  // Supabase browser client already has autoRefreshToken: true by default
  const supabase = createClient()
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login')
          router.refresh()
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Access token was refreshed automatically by Supabase client.')
          // Client-side supabase manages storing the new tokens automatically.
          router.refresh() // Optional: force RSCs to get the fresh cookie state 
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  return <>{children}</>
}
