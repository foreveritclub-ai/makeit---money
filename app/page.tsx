'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // User is authenticated, redirect to dashboard
          router.push('/protected/dashboard')
        } else {
          // User is not authenticated, redirect to signin
          router.push('/auth/signin')
        }
      } catch (error) {
        console.log("[v0] Auth check error - redirecting to signin")
        router.push('/auth/signin')
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-zinc-400">Loading...</p>
      </div>
    </div>
  )
}
