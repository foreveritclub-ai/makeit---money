"use client"

import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Award,
  History,
  LogOut,
  ChevronRight,
  Copy,
  Check,
  Star
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { VERIFIED_THRESHOLD, WITHDRAWAL_LIMITS } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, transactions, tokens, deposits, withdrawals, wallets } = useAppStore()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const tierProgress = user ? (user.totalDeposits / VERIFIED_THRESHOLD) * 100 : 0
  const limits = WITHDRAWAL_LIMITS[user?.tier || 'basic']
  const activeTokens = tokens.filter(t => t.daysRemaining > 0)

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
              {user?.name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
                {user?.tier === 'verified' && (
                  <span className="text-yellow-400">&#10004;</span>
                )}
              </div>
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                user?.tier === 'verified' ? 'bg-yellow-500/20 text-yellow-400' :
                user?.tier === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-zinc-500/20 text-zinc-400'
              )}>
                {user?.tier === 'verified' && <Shield className="w-3 h-3" />}
                {user?.tier === 'premium' && <Award className="w-3 h-3" />}
                {user?.tier === 'premium' ? 'Agent' : user?.tier === 'verified' ? 'Verified' : 'Basic'}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-current" />
              <span className="text-sm text-zinc-400">Score</span>
            </div>
            <span className="text-lg font-bold text-white">{user?.score || 0} pts</span>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">{user?.email || 'Not set'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(user?.email || '', 'email')}
                className="text-zinc-500 hover:text-white h-8 w-8 p-0"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-300">{user?.phone || 'Not set'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(user?.phone || '', 'phone')}
                className="text-zinc-500 hover:text-white h-8 w-8 p-0"
              >
                {copiedField === 'phone' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tier Progress (for non-verified) */}
        {user?.tier !== 'verified' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Progress to Verified</span>
              <span className="text-sm text-yellow-400 font-medium">
                {user?.totalDeposits.toLocaleString()} / {VERIFIED_THRESHOLD.toLocaleString()} FRW
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(tierProgress, 100)}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Deposit {(VERIFIED_THRESHOLD - (user?.totalDeposits || 0)).toLocaleString()} FRW more to become Verified
            </p>
          </motion.div>
        )}

        {/* Account Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Total Balance</p>
            <p className="text-lg font-bold text-white">
              {(wallets.glassBalance + wallets.blackBalance).toLocaleString()} FRW
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Active Tokens</p>
            <p className="text-lg font-bold text-white">{activeTokens.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Total Deposits</p>
            <p className="text-lg font-bold text-white">{deposits.length}</p>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Transactions</p>
            <p className="text-lg font-bold text-white">{transactions.length}</p>
          </div>
        </motion.div>

        {/* Withdrawal Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800"
        >
          <h3 className="font-semibold text-white mb-3">Withdrawal Limits</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Daily Limit</span>
              <span className="text-sm text-white font-medium">{limits.daily.toLocaleString()} FRW</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Monthly Limit</span>
              <span className="text-sm text-white font-medium">{limits.monthly.toLocaleString()} FRW</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Link href="/deposit">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <History className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium text-white">Deposit History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
          </Link>
          <Link href="/withdraw">
            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <History className="w-5 h-5 text-red-400" />
                </div>
                <span className="font-medium text-white">Withdrawal History</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
          </Link>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-white mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">
                    {tx.description}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(tx.createdAt).toLocaleString('en-RW', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FRW
                </span>
              </motion.div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-zinc-500 py-4">No transactions yet</p>
            )}
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </main>

      <MobileNav />
    </div>
  )
}
