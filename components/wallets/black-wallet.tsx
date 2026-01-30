"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ArrowUpRight, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface BlackWalletProps {
  balance: number
  previousBalance?: number
  showAnimation?: boolean
  className?: string
}

interface Note {
  id: number
  value: number
  x: number
  delay: number
  rotation: number
}

const NOTE_VALUES = [500, 1000, 2000, 5000]
const NOTE_COLORS: Record<number, string> = {
  500: "from-emerald-500 to-emerald-700",
  1000: "from-blue-500 to-blue-700",
  2000: "from-purple-500 to-purple-700",
  5000: "from-amber-500 to-amber-700",
}

export function BlackWallet({ 
  balance, 
  previousBalance = 0, 
  showAnimation = false,
  className 
}: BlackWalletProps) {
  const [displayBalance, setDisplayBalance] = useState(balance)
  const [notes, setNotes] = useState<Note[]>([])
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
      
      // Generate falling notes
      const newNotes = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        value: NOTE_VALUES[Math.floor(Math.random() * NOTE_VALUES.length)],
        x: Math.random() * 60 + 20,
        delay: i * 0.12,
        rotation: Math.random() * 40 - 20,
      }))
      setNotes(newNotes)

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
          setTimeout(() => setNotes([]), 500)
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
        "bg-gradient-to-br from-zinc-900 via-neutral-900 to-black",
        "border border-zinc-700/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        "animate-pulse h-[140px]",
        className
      )} />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-zinc-900 via-neutral-900 to-black",
        "border border-zinc-700/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzAwMCI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9IiMxYTFhMWEiPjwvY2lyY2xlPgo8L3N2Zz4=')] opacity-30" />
      
      {/* Security badge */}
      <div className="absolute top-4 right-4 text-zinc-500">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Shield className="w-5 h-5" />
        </motion.div>
      </div>
      
      {/* Falling notes animation */}
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ y: -60, x: `${note.x}%`, opacity: 0, rotate: note.rotation, scale: 0.5 }}
            animate={{ 
              y: 160, 
              opacity: [0, 1, 1, 0.8, 0], 
              rotate: [note.rotation, note.rotation + 180, note.rotation + 360],
              scale: [0.5, 1, 1, 0.8]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              delay: note.delay,
              ease: "easeIn"
            }}
            className="absolute top-0 pointer-events-none z-20"
          >
            <div className={cn(
              "w-14 h-7 rounded-sm shadow-xl flex items-center justify-center",
              "bg-gradient-to-r border border-white/20",
              NOTE_COLORS[note.value]
            )}>
              <span className="text-[10px] font-bold text-white drop-shadow">{note.value}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800">
            <Wallet className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-300">Black Wallet</h3>
            <p className="text-xs text-zinc-500">Deposits & Funds</p>
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
          <span className="text-lg text-zinc-500">FRW</span>
        </div>

        {balance > previousBalance && previousBalance > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 mt-2 text-emerald-500"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">
              +{(balance - previousBalance).toLocaleString()} FRW
            </span>
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-zinc-700/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent" />
    </motion.div>
  )
}
