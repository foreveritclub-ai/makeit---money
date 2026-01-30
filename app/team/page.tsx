"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Copy, 
  Check, 
  Share2, 
  TrendingUp,
  UserPlus,
  Coins,
  ChevronRight
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { REFERRAL_RATES } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function TeamPage() {
  const { user, referrals, transactions } = useAppStore()
  const [copied, setCopied] = useState(false)

  const referralLink = `https://virtuixrw.com/ref/${user?.referralCode || ''}`
  
  const commissionTx = transactions.filter(tx => tx.type === 'commission')
  const totalCommissions = commissionTx.reduce((sum, tx) => sum + tx.amount, 0)
  
  const level1Refs = referrals.filter(r => r.level === 1)
  const level2Refs = referrals.filter(r => r.level === 2)
  const level3Refs = referrals.filter(r => r.level === 3)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join VirtuixRW',
        text: `Join VirtuixRW and start earning! Use my referral code: ${user?.referralCode}`,
        url: referralLink,
      })
    } else {
      handleCopy()
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
            <div className="p-2 rounded-xl bg-blue-500/10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Team</h1>
              <p className="text-zinc-500 text-sm">Invite friends & earn commissions</p>
            </div>
          </div>
        </motion.div>

        {/* Referral Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-zinc-500">Total Referrals</span>
            </div>
            <p className="text-2xl font-bold text-white">{referrals.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400/70">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{totalCommissions.toLocaleString()} FRW</p>
          </div>
        </motion.div>

        {/* Referral Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        >
          <h3 className="font-semibold text-white mb-2">Your Referral Code</h3>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-700 mb-4">
            <span className="flex-1 font-mono text-lg text-blue-400 font-bold tracking-wider">
              {user?.referralCode || 'LOADING...'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleCopy}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Commission Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800"
        >
          <h3 className="font-semibold text-white mb-4">Commission Structure</h3>
          <div className="space-y-3">
            {[
              { level: 1, rate: REFERRAL_RATES.level1, count: level1Refs.length, color: 'blue' },
              { level: 2, rate: REFERRAL_RATES.level2, count: level2Refs.length, color: 'purple' },
              { level: 3, rate: REFERRAL_RATES.level3, count: level3Refs.length, color: 'pink' },
            ].map((tier) => (
              <div 
                key={tier.level}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl",
                  `bg-${tier.color}-500/10 border border-${tier.color}-500/20`
                )}
                style={{ 
                  backgroundColor: tier.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' : 
                                   tier.color === 'purple' ? 'rgba(168, 85, 247, 0.1)' : 
                                   'rgba(236, 72, 153, 0.1)',
                  borderColor: tier.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 
                               tier.color === 'purple' ? 'rgba(168, 85, 247, 0.2)' : 
                               'rgba(236, 72, 153, 0.2)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ 
                      backgroundColor: tier.color === 'blue' ? '#3b82f6' : 
                                       tier.color === 'purple' ? '#a855f7' : 
                                       '#ec4899'
                    }}
                  >
                    L{tier.level}
                  </div>
                  <div>
                    <p className="font-medium text-white">Level {tier.level} Referrals</p>
                    <p className="text-xs text-zinc-500">{tier.count} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{tier.rate * 100}%</p>
                  <p className="text-xs text-zinc-500">commission</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Recent Referrals</h3>
          </div>
          
          {referrals.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
              <UserPlus className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-500 mb-1">No referrals yet</p>
              <p className="text-sm text-zinc-600">Share your referral code to start earning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral, index) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {referral.referredName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{referral.referredName}</p>
                    <p className="text-xs text-zinc-500">
                      Level {referral.level} - {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {referral.commission > 0 && (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+{referral.commission.toLocaleString()}</span>
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
        >
          <h3 className="font-semibold text-amber-400 mb-3">How Referrals Work</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">1.</span>
              Share your unique referral code with friends
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">2.</span>
              They sign up using your code and make purchases
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">3.</span>
              You earn 5% on their sales (Level 1)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">4.</span>
              Earn 3% when they invite others (Level 2) and 1% on Level 3
            </li>
          </ul>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  )
}
