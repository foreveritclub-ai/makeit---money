"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Coins, Filter, TrendingUp } from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { TokenCard } from "@/components/market/token-card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { BASIC_TOKENS, PREMIUM_TOKENS, VERIFIED_TOKENS, ALL_TOKENS } from "@/lib/types"
import { cn } from "@/lib/utils"

type FilterType = 'all' | 'basic' | 'premium' | 'verified'

export default function MarketPage() {
  const { wallets, tokens } = useAppStore()
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredTokens = filter === 'all' 
    ? ALL_TOKENS 
    : filter === 'basic' 
      ? BASIC_TOKENS 
      : filter === 'premium' 
        ? PREMIUM_TOKENS 
        : VERIFIED_TOKENS

  const activeTokens = tokens.filter(t => t.daysRemaining > 0)
  const totalDailyEarnings = activeTokens.reduce((sum, t) => sum + t.token.dailyReturn, 0)

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Token Market</h1>
              <p className="text-zinc-500 text-sm">Invest in tokens for 12% daily returns</p>
            </div>
          </div>
        </motion.div>

        {/* Balance & Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Available Balance</p>
            <p className="text-xl font-bold text-white">
              {wallets.blackBalance.toLocaleString()} <span className="text-sm text-zinc-500">FRW</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400/70 mb-1">Daily Earnings</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <p className="text-xl font-bold text-emerald-400">
                +{totalDailyEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 overflow-x-auto pb-2"
        >
          {[
            { key: 'all', label: 'All Tokens', count: ALL_TOKENS.length },
            { key: 'basic', label: 'Basic', count: BASIC_TOKENS.length },
            { key: 'premium', label: 'Agent', count: PREMIUM_TOKENS.length },
            { key: 'verified', label: 'Verified', count: VERIFIED_TOKENS.length },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(tab.key as FilterType)}
              className={cn(
                "whitespace-nowrap rounded-full",
                filter === tab.key 
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" 
                  : "text-zinc-400 hover:text-white"
              )}
            >
              <Filter className="w-3 h-3 mr-1" />
              {tab.label}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-zinc-800 text-xs">
                {tab.count}
              </span>
            </Button>
          ))}
        </motion.div>

        {/* Token Grid */}
        <div className="grid gap-4">
          {filteredTokens.map((token, index) => (
            <TokenCard key={token.id} token={token} index={index} />
          ))}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
        >
          <h3 className="font-semibold text-blue-400 mb-2">How Tokens Work</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-400">1.</span>
              Purchase a token with your Black Wallet balance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">2.</span>
              Earn 12% daily returns for 90 days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">3.</span>
              Profits are automatically added to your Glass Wallet
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400">4.</span>
              Agent tokens unlock Premium tier access
            </li>
          </ul>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  )
}
