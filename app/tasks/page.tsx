"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CalendarCheck, 
  Clock, 
  Gift, 
  Sparkles, 
  Check,
  Flame,
  Star
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { CHECKIN_REWARD } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TasksPage() {
  const { 
    claimDailyCheckIn, 
    claimHourlyCheckIn, 
    canClaimDaily, 
    canClaimHourly,
    checkIns,
    wallets
  } = useAppStore()

  const [dailyAvailable, setDailyAvailable] = useState(false)
  const [hourlyAvailable, setHourlyAvailable] = useState(false)
  const [showReward, setShowReward] = useState<'daily' | 'hourly' | null>(null)
  const [hourlyCountdown, setHourlyCountdown] = useState("")

  // Calculate streak (consecutive daily check-ins)
  const todayCheckins = checkIns.filter(c => {
    const claimDate = new Date(c.claimedAt)
    const today = new Date()
    return claimDate.toDateString() === today.toDateString()
  })

  const dailyCheckinsToday = todayCheckins.filter(c => c.type === 'daily').length
  const hourlyCheckinsToday = todayCheckins.filter(c => c.type === 'hourly').length

  useEffect(() => {
    const updateAvailability = () => {
      setDailyAvailable(canClaimDaily())
      setHourlyAvailable(canClaimHourly())
    }
    
    updateAvailability()
    const interval = setInterval(updateAvailability, 1000)
    return () => clearInterval(interval)
  }, [canClaimDaily, canClaimHourly])

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
      const diff = nextHour.getTime() - now.getTime()
      
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setHourlyCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleDailyClaim = () => {
    if (claimDailyCheckIn()) {
      setShowReward('daily')
      setTimeout(() => setShowReward(null), 2000)
    }
  }

  const handleHourlyClaim = () => {
    if (claimHourlyCheckIn()) {
      setShowReward('hourly')
      setTimeout(() => setShowReward(null), 2000)
    }
  }

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
            <div className="p-2 rounded-xl bg-purple-500/10">
              <Gift className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Tasks</h1>
              <p className="text-zinc-500 text-sm">Claim your rewards daily</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-semibold text-white">Today&apos;s Progress</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">
                {(dailyCheckinsToday + hourlyCheckinsToday) * CHECKIN_REWARD} FRW earned
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-zinc-900/50">
              <p className="text-xs text-zinc-500">Daily Check-ins</p>
              <p className="text-lg font-bold text-white">{dailyCheckinsToday}/1</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/50">
              <p className="text-xs text-zinc-500">Hourly Check-ins</p>
              <p className="text-lg font-bold text-white">{hourlyCheckinsToday}/24</p>
            </div>
          </div>
        </motion.div>

        {/* Reward Animation Overlay */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Reward Claimed!</h2>
                <p className="text-3xl font-bold text-amber-400">+{CHECKIN_REWARD} FRW</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Check-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "p-5 rounded-2xl border transition-all",
            dailyAvailable 
              ? "bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30" 
              : "bg-zinc-900/50 border-zinc-800"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              dailyAvailable ? "bg-emerald-500/20" : "bg-zinc-800"
            )}>
              <CalendarCheck className={cn(
                "w-6 h-6",
                dailyAvailable ? "text-emerald-400" : "text-zinc-500"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white">Daily Check-in</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  +{CHECKIN_REWARD} FRW
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-4">
                Claim your daily reward once every 24 hours
              </p>
              <Button
                onClick={handleDailyClaim}
                disabled={!dailyAvailable}
                className={cn(
                  "w-full font-semibold",
                  dailyAvailable 
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white" 
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {dailyAvailable ? (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Daily Reward
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Claimed Today
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Hourly Check-in Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "p-5 rounded-2xl border transition-all",
            hourlyAvailable 
              ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30" 
              : "bg-zinc-900/50 border-zinc-800"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              hourlyAvailable ? "bg-blue-500/20" : "bg-zinc-800"
            )}>
              <Clock className={cn(
                "w-6 h-6",
                hourlyAvailable ? "text-blue-400" : "text-zinc-500"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white">Hourly Check-in</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  +{CHECKIN_REWARD} FRW
                </span>
              </div>
              <p className="text-sm text-zinc-500 mb-2">
                Claim your hourly reward every hour
              </p>
              {!hourlyAvailable && (
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-zinc-800/50">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">Next reward in {hourlyCountdown}</span>
                </div>
              )}
              <Button
                onClick={handleHourlyClaim}
                disabled={!hourlyAvailable}
                className={cn(
                  "w-full font-semibold",
                  hourlyAvailable 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white" 
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {hourlyAvailable ? (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Hourly Reward
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Wait for Next Hour
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Max Daily Earnings Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800"
        >
          <h3 className="font-semibold text-white mb-3">Maximum Daily Earnings</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Daily Check-in (1x)</span>
              <span className="text-white font-medium">{CHECKIN_REWARD} FRW</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Hourly Check-ins (24x)</span>
              <span className="text-white font-medium">{CHECKIN_REWARD * 24} FRW</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">Total Possible</span>
                <span className="text-emerald-400 font-bold">{CHECKIN_REWARD * 25} FRW/day</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  )
}
