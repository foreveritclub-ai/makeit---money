"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Lock, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { Token, TOKEN_COLORS } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TokenCardProps {
  token: Token
  index: number
}

export function TokenCard({ token, index }: TokenCardProps) {
  const { user, wallets, purchaseToken, tokens } = useAppStore()
  const [isPurchasing, setIsPurchasing] = useState(false)
  
  const canPurchase = 
    wallets.blackBalance >= token.price &&
    (token.tier === 'basic' || 
     (token.tier === 'premium' && (user?.tier === 'premium' || user?.tier === 'verified')) ||
     (token.tier === 'verified' && user?.tier === 'verified'))
  
  const isLocked = 
    (token.tier === 'premium' && user?.tier === 'basic') ||
    (token.tier === 'verified' && user?.tier !== 'verified')
  
  const alreadyOwned = tokens.some(t => t.tokenId === token.id && t.daysRemaining > 0)

  const handlePurchase = async () => {
    if (!canPurchase || alreadyOwned) return
    setIsPurchasing(true)
    
    // Simulate purchase delay for animation
    await new Promise(resolve => setTimeout(resolve, 500))
    purchaseToken(token)
    setIsPurchasing(false)
  }

  const tierBadgeColors = {
    basic: "bg-zinc-700 text-zinc-300",
    premium: "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
    verified: "bg-gradient-to-r from-yellow-400 to-amber-400 text-black",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative p-4 rounded-2xl border transition-all duration-300",
        isLocked 
          ? "bg-zinc-900/30 border-zinc-800/50 opacity-60" 
          : "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700",
        alreadyOwned && "ring-2 ring-emerald-500/50"
      )}
    >
      {/* Tier Badge */}
      <div className="absolute top-3 right-3">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
          tierBadgeColors[token.tier]
        )}>
          {token.tier === 'premium' ? 'Agent' : token.tier}
        </span>
      </div>

      {/* Token Colors */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {token.colors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 + i * 0.1 }}
              className={cn(
                "w-10 h-10 rounded-full border-3 border-zinc-900 shadow-lg",
                i > 0 && "-ml-3"
              )}
              style={{ 
                backgroundColor: TOKEN_COLORS[color],
                boxShadow: `0 4px 12px ${TOKEN_COLORS[color]}40`
              }}
            />
          ))}
        </div>
        {isLocked && (
          <Lock className="w-5 h-5 text-zinc-500 ml-auto" />
        )}
        {alreadyOwned && (
          <div className="ml-auto flex items-center gap-1 text-emerald-400">
            <Check className="w-4 h-4" />
            <span className="text-xs font-medium">Owned</span>
          </div>
        )}
      </div>

      {/* Token Info */}
      <h3 className="font-semibold text-white mb-1">{token.name}</h3>
      <p className="text-2xl font-bold text-white mb-2">
        {token.price.toLocaleString()} <span className="text-sm text-zinc-500">FRW</span>
      </p>

      {/* Daily Return */}
      <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-emerald-500/10">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-emerald-400 font-medium">
          +{token.dailyReturn.toLocaleString()} FRW/day
        </span>
        <span className="text-xs text-zinc-500 ml-auto">12% for 90 days</span>
      </div>

      {/* Total Return Info */}
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
        <span>Total Return (90 days)</span>
        <span className="text-emerald-400 font-medium">
          +{(token.dailyReturn * 90).toLocaleString()} FRW
        </span>
      </div>

      {/* Purchase Button */}
      <Button
        onClick={handlePurchase}
        disabled={!canPurchase || isPurchasing || alreadyOwned}
        className={cn(
          "w-full font-semibold",
          canPurchase && !alreadyOwned
            ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            : "bg-zinc-800 text-zinc-500"
        )}
      >
        {isPurchasing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ) : alreadyOwned ? (
          "Already Owned"
        ) : isLocked ? (
          `Requires ${token.tier === 'premium' ? 'Agent' : 'Verified'} tier`
        ) : wallets.blackBalance < token.price ? (
          "Insufficient Balance"
        ) : (
          "Purchase Token"
        )}
      </Button>
    </motion.div>
  )
}
