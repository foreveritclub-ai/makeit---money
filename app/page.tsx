"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useAppStore } from "@/lib/store"
import { GlassWallet, BlackWallet } from "@/components/wallets"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActiveTokens } from "@/components/dashboard/active-tokens"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"

export default function DashboardPage() {
  const { user, wallets, initDemoUser } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const prevWalletsRef = useRef({ glassBalance: 0, blackBalance: 0 })

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      initDemoUser()
    }
  }, [mounted, user, initDemoUser])

  // Track wallet changes for animations
  useEffect(() => {
    if (!mounted) return

    const prevWallets = prevWalletsRef.current
    
    if (wallets.glassBalance !== prevWallets.glassBalance || 
        wallets.blackBalance !== prevWallets.blackBalance) {
      setShowAnimation(true)
      const timer = setTimeout(() => {
        prevWalletsRef.current = { ...wallets }
        setShowAnimation(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [wallets, mounted])

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 pb-24">
        <div className="h-16 bg-zinc-900/50 animate-pulse" />
        <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
          <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
          <div className="h-[140px] bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-[140px] bg-zinc-800 rounded-2xl animate-pulse" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-zinc-500 mt-1">
            Your trading journey continues
          </p>
        </motion.div>

        {/* Wallets Section */}
        <div className="grid gap-4">
          <GlassWallet 
            balance={wallets.glassBalance} 
            previousBalance={prevWalletsRef.current.glassBalance}
            showAnimation={showAnimation}
          />
          <BlackWallet 
            balance={wallets.blackBalance} 
            previousBalance={prevWalletsRef.current.blackBalance}
            showAnimation={showAnimation}
          />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
          <QuickActions />
        </section>

        {/* Stats Overview */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Overview</h2>
          <StatsCard />
        </section>

        {/* Active Tokens */}
        <section>
          <ActiveTokens />
        </section>

        {/* Recent Transactions */}
        <section>
          <RecentTransactions />
        </section>
      </main>

      <MobileNav />
    </div>
  )
}
