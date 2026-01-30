"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Clock, Coins, Target } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function StatsCard() {
  const { user, tokens, deposits } = useAppStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeTokens = tokens.filter(t => t.daysRemaining > 0)
  const totalDailyEarnings = activeTokens.reduce((sum, t) => sum + t.token.dailyReturn, 0)
  const completedDeposits = deposits.filter(d => d.status === 'profit_paid').length

  const stats = [
    {
      label: "Daily Earnings",
      value: totalDailyEarnings.toLocaleString(),
      suffix: "FRW",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Active Tokens",
      value: activeTokens.length.toString(),
      suffix: "tokens",
      icon: Coins,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Total Deposits",
      value: (user?.totalDeposits || 0).toLocaleString(),
      suffix: "FRW",
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Profits Earned",
      value: completedDeposits.toString(),
      suffix: "times",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse h-24" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800"
        >
          <div className={`p-2 rounded-lg ${stat.bgColor} w-fit mb-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">{stat.value}</span>
            <span className="text-xs text-zinc-500">{stat.suffix}</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
