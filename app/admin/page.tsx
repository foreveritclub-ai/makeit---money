"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Check, 
  X, 
  Clock, 
  Phone, 
  User,
  DollarSign,
  AlertCircle,
  ChevronDown,
  Search,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import Link from "next/link"

const ADMIN_PASSWORD = "VirtuixAdmin2024"

export default function AdminPage() {
  const { 
    isAdmin, 
    setAdmin, 
    pendingDeposits, 
    confirmDeposit, 
    rejectDeposit,
    deposits,
    withdrawals,
    wallets,
    transactions,
    user
  } = useAppStore()
  
  const [mounted, setMounted] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending')
  const [searchQuery, setSearchQuery] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdmin(true)
      setError("")
    } else {
      setError("Invalid admin password")
    }
  }

  const handleConfirm = async (id: string) => {
    setProcessingId(id)
    await new Promise(resolve => setTimeout(resolve, 1000))
    confirmDeposit(id)
    setProcessingId(null)
  }

  const handleReject = async (id: string) => {
    setProcessingId(id)
    await new Promise(resolve => setTimeout(resolve, 500))
    rejectDeposit(id)
    setProcessingId(null)
  }

  const filteredDeposits = pendingDeposits
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => 
      searchQuery === "" || 
      d.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery) ||
      d.transactionId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const stats = {
    pending: pendingDeposits.filter(d => d.status === 'pending').length,
    confirmed: pendingDeposits.filter(d => d.status === 'confirmed').length,
    rejected: pendingDeposits.filter(d => d.status === 'rejected').length,
    totalDeposits: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, w) => sum + w.amount, 0),
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500" />
      </div>
    )
  }

  // Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Shield className="w-10 h-10 text-amber-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
            <p className="text-zinc-500 text-center text-sm mb-8">
              VirtuixRW Administration Panel
            </p>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="pl-12 pr-12 py-6 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <Button
                onClick={handleLogin}
                className="w-full py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold text-lg rounded-xl"
              >
                Access Admin Panel
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <Link href="/">
                <Button variant="ghost" className="w-full text-zinc-500 hover:text-white">
                  Back to App
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <Shield className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-zinc-500">VirtuixRW Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 bg-transparent">
                  View App
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setAdmin(false)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-amber-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-emerald-400">Confirmed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-400">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownToLine className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-400">Total Deposits</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalDeposits.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">FRW</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpFromLine className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-400">Total Withdrawals</span>
            </div>
            <p className="text-xl font-bold text-white">{stats.totalWithdrawals.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">FRW</p>
          </motion.div>
        </div>

        {/* MTN Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="font-bold text-black text-lg">MTN</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">MTN Mobile Money Rwanda</h3>
              <p className="text-sm text-zinc-400">Payment receiving account</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-zinc-900/50">
              <p className="text-xs text-zinc-500 mb-1">Phone Number</p>
              <p className="text-lg font-mono font-bold text-amber-400">0790316694</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/50">
              <p className="text-xs text-zinc-500 mb-1">Registered Name</p>
              <p className="text-lg font-semibold text-white">Vestine Nganabashaka</p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'confirmed', 'rejected'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className={cn(
                  filter === f 
                    ? "bg-amber-500 text-black hover:bg-amber-600" 
                    : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && stats.pending > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">
                    {stats.pending}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search by name, phone, or transaction ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Pending Deposits List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Deposit Requests
            {stats.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-sm">
                {stats.pending} pending
              </span>
            )}
          </h2>

          <AnimatePresence>
            {filteredDeposits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center"
              >
                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500">No deposits found</p>
              </motion.div>
            ) : (
              filteredDeposits.map((deposit, index) => (
                <motion.div
                  key={deposit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-5 rounded-2xl border",
                    deposit.status === 'pending' 
                      ? "bg-zinc-900/80 border-amber-500/30" 
                      : deposit.status === 'confirmed'
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-800">
                          <User className="w-5 h-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{deposit.userName}</p>
                          <p className="text-sm text-zinc-500">Order: {deposit.oderId}</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-2 rounded-lg bg-zinc-800/50">
                          <p className="text-xs text-zinc-500">Amount</p>
                          <p className="font-bold text-emerald-400">{deposit.amount.toLocaleString()} FRW</p>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-800/50">
                          <p className="text-xs text-zinc-500">Phone</p>
                          <p className="font-mono text-white">{deposit.phone}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-800/50">
                          <p className="text-xs text-zinc-500">Transaction ID</p>
                          <p className="font-mono text-white text-sm">{deposit.transactionId}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-zinc-800/50">
                          <p className="text-xs text-zinc-500">Date</p>
                          <p className="text-white text-sm">
                            {new Date(deposit.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {deposit.status === 'pending' ? (
                        <>
                          <Button
                            onClick={() => handleConfirm(deposit.id)}
                            disabled={processingId === deposit.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {processingId === deposit.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Confirm
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(deposit.id)}
                            disabled={processingId === deposit.id}
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <div className={cn(
                          "px-4 py-2 rounded-xl font-semibold",
                          deposit.status === 'confirmed' 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {deposit.status === 'confirmed' ? (
                            <span className="flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Confirmed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <X className="w-4 h-4" />
                              Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recent Transactions
          </h2>
          
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2 max-h-[400px] overflow-y-auto">
            {transactions.slice(0, 20).map((tx, index) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50"
              >
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className={cn(
                  "font-bold",
                  tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FRW
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-zinc-500 py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
