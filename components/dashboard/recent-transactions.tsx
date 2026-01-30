"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  Gift, 
  Users,
  Zap,
  RefreshCw
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import Link from "next/link"

const typeIcons = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  profit: Coins,
  commission: Users,
  checkin: Gift,
  room_bonus: Zap,
  token_profit: Coins,
  transfer: RefreshCw,
}

const typeColors = {
  deposit: "text-emerald-400 bg-emerald-500/10",
  withdrawal: "text-red-400 bg-red-500/10",
  profit: "text-amber-400 bg-amber-500/10",
  commission: "text-blue-400 bg-blue-500/10",
  checkin: "text-purple-400 bg-purple-500/10",
  room_bonus: "text-cyan-400 bg-cyan-500/10",
  token_profit: "text-amber-400 bg-amber-500/10",
  transfer: "text-zinc-400 bg-zinc-500/10",
}

export function RecentTransactions() {
  const { transactions } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const recentTx = transactions.slice(0, 5)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (recentTx.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
        <p className="text-zinc-500">No transactions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Recent Activity</h3>
        <Link href="/profile" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {recentTx.map((tx, index) => {
          const Icon = typeIcons[tx.type]
          const colorClasses = typeColors[tx.type]
          const isPositive = tx.amount > 0

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
            >
              <div className={cn("p-2 rounded-lg", colorClasses.split(" ")[1])}>
                <Icon className={cn("w-4 h-4", colorClasses.split(" ")[0])} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(tx.createdAt).toLocaleDateString('en-RW', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}>
                {isPositive ? "+" : ""}{tx.amount.toLocaleString()} FRW
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
