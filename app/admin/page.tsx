'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AdminDashboard } from './dashboard'

export default function AdminPage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user logged in as admin via auth page
    const adminToken = sessionStorage.getItem('adminToken')
    if (adminToken === 'true') {
      setIsVerified(true)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-6">Login via authentication page first</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
