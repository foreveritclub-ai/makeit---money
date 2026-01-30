"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, TrendingUp, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlassWalletProps {
  balance: number
  previousBalance?: number
  showAnimation?: boolean
  className?: string
}

interface Coin {
  id: number
  x: number
  delay: number
}

export function GlassWallet({ 
  balance, 
  previousBalance = 0, 
  showAnimation = false,
  className 
}: GlassWalletProps) {
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [coins, setCoins] = useState<Coin[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const prevBalanceRef = useRef(balance)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    setDisplayBalance(balance)
  }, [balance])

  // Animate on balance change
  useEffect(() => {
    if (!mounted) return
    
    const diff = balance - prevBalanceRef.current
    
    if (diff > 0 && showAnimation) {
      setIsAnimating(true)
      
      // Generate falling coins
      const newCoins = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 70 + 15,
        delay: i * 0.08,
      }))
      setCoins(newCoins)

      // Animate balance counter
      const duration = 1500
      const startTime = Date.now()
      const startValue = prevBalanceRef.current
      const endValue = balance
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplayBalance(Math.round(startValue + (endValue - startValue) * eased))
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          setTimeout(() => setCoins([]), 500)
        }
      }
      
      requestAnimationFrame(animate)
    } else {
      setDisplayBalance(balance)
    }
    
    prevBalanceRef.current = balance
  }, [balance, showAnimation, mounted])

  if (!mounted) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20",
        "backdrop-blur-xl border border-white/20",
        "shadow-[0_8px_32px_rgba(0,200,255,0.15)]",
        "animate-pulse h-[140px]",
        className
      )} />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20",
        "backdrop-blur-xl border border-white/20",
        "shadow-[0_8px_32px_rgba(0,200,255,0.15)]",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
      
      {/* Sparkle effects */}
      <div className="absolute top-4 right-4 text-cyan-400/60">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
      </div>
      
      {/* Falling coins animation */}
      <AnimatePresence>
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ y: -50, x: `${coin.x}%`, opacity: 0, rotate: 0, scale: 0.5 }}
            animate={{ 
              y: 150, 
              opacity: [0, 1, 1, 0.8, 0], 
              rotate: [0, 180, 360],
              scale: [0.5, 1, 1, 0.8]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.4, 
              delay: coin.delay,
              ease: "easeIn"
            }}
            className="absolute top-0 pointer-events-none z-20"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-lg flex items-center justify-center border-2 border-yellow-200">
              <span className="text-xs font-bold text-yellow-900">F</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/30 backdrop-blur">
            <Coins className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-cyan-100/80">Glass Wallet</h3>
            <p className="text-xs text-cyan-200/50">Profits & Bonuses</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <motion.span 
            key={displayBalance}
            className="text-3xl font-bold text-white"
            animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: isAnimating ? Infinity : 0, repeatDelay: 0.2 }}
          >
            {displayBalance.toLocaleString()}
          </motion.span>
          <span className="text-lg text-cyan-200/60">FRW</span>
        </div>

        {balance > previousBalance && previousBalance > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 mt-2 text-emerald-400"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              +{(balance - previousBalance).toLocaleString()} FRW
            </span>
          </motion.div>
        )}
      </div>

      {/* Decorative glass shards */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-xl" />
      <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-2xl" />
    </motion.div>
  )
}
