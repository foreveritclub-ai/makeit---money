"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, TrendingUp } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { TOKEN_COLORS } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function ActiveTokens() {
  const { tokens } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const activeTokens = tokens.filter(t => t.daysRemaining > 0).slice(0, 3)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
      </div>
    )
  }

  if (activeTokens.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
        <p className="text-zinc-500 mb-4">No active tokens yet</p>
        <Link href="/market">
          <Button variant="outline" size="sm">
            Browse Tokens
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Active Tokens</h3>
        <Link href="/market" className="text-sm text-blue-400 hover:text-blue-300">
          View all
        </Link>
      </div>
      {activeTokens.map((userToken, index) => (
        <motion.div
          key={userToken.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {userToken.token.colors.map((color, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-zinc-800",
                    i > 0 && "-ml-2"
                  )}
                  style={{ backgroundColor: TOKEN_COLORS[color] }}
                />
              ))}
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{userToken.token.name}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                <span>{userToken.daysRemaining} days left</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">+{userToken.token.dailyReturn.toLocaleString()}</span>
              </div>
              <p className="text-xs text-zinc-500">FRW/day</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Progress</span>
              <span>{90 - userToken.daysRemaining}/90 days</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((90 - userToken.daysRemaining) / 90) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
