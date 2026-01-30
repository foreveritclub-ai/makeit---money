"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowUpFromLine, 
  Check, 
  AlertCircle, 
  Phone,
  Sparkles,
  ChevronLeft,
  Info,
  Wallet
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { 
  WITHDRAWAL_FEE_RATE, 
  WITHDRAWAL_MIN_FEE, 
  WITHDRAWAL_LIMITS 
} from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function WithdrawPage() {
  const { user, wallets, deposits, withdrawals, requestWithdrawal, transferToBlack } = useAppStore()
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '')
  const [step, setStep] = useState<'form' | 'confirm' | 'success' | 'error'>('form')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  const hasDeposit = deposits.length > 0
  const limits = WITHDRAWAL_LIMITS[user?.tier || 'basic']
  const numAmount = parseInt(amount) || 0
  const fee = Math.max(numAmount * WITHDRAWAL_FEE_RATE, WITHDRAWAL_MIN_FEE)
  const netAmount = numAmount - fee

  const canWithdraw = 
    hasDeposit && 
    numAmount > 0 && 
    numAmount <= wallets.blackBalance && 
    numAmount <= limits.daily &&
    phoneNumber.length >= 10

  const handleWithdraw = async () => {
    if (!canWithdraw) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const result = requestWithdrawal(numAmount)
    setIsProcessing(false)
    
    if (result.success) {
      setStep('success')
    } else {
      setErrorMessage(result.message)
      setStep('error')
    }
  }

  const handleTransfer = () => {
    const transferNum = parseInt(transferAmount) || 0
    if (transferNum > 0 && transferNum <= wallets.glassBalance) {
      transferToBlack(transferNum)
      setTransferAmount('')
    }
  }

  const recentWithdrawals = withdrawals.slice(0, 5)

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <Header />
      
      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Back Button */}
        {step !== 'form' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('form')}
            className="text-zinc-400 hover:text-white -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <ArrowUpFromLine className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Withdraw</h1>
              <p className="text-zinc-500 text-sm">Transfer funds to mobile money</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Form Step */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* No Deposit Warning */}
              {!hasDeposit && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-400 font-medium">Deposit Required</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        You must make at least one deposit before you can withdraw funds.
                      </p>
                      <Link href="/deposit">
                        <Button size="sm" className="mt-3 bg-red-500 hover:bg-red-600 text-white">
                          Make a Deposit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Wallet Balances */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Black Wallet</p>
                  <p className="text-xl font-bold text-white">
                    {wallets.blackBalance.toLocaleString()} <span className="text-xs text-zinc-500">FRW</span>
                  </p>
                  <p className="text-xs text-emerald-400 mt-1">Available for withdrawal</p>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-cyan-400/70 mb-1">Glass Wallet</p>
                  <p className="text-xl font-bold text-cyan-400">
                    {wallets.glassBalance.toLocaleString()} <span className="text-xs text-cyan-400/70">FRW</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Transfer to Black first</p>
                </div>
              </div>

              {/* Transfer from Glass to Black */}
              {wallets.glassBalance > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Transfer to Black Wallet</span>
                    <span className="text-xs text-zinc-500">(1% fee)</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="Amount"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <Button
                      onClick={handleTransfer}
                      disabled={!transferAmount || parseInt(transferAmount) > wallets.glassBalance}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white"
                    >
                      Transfer
                    </Button>
                  </div>
                </div>
              )}

              {/* Withdrawal Limits */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Your Limits ({user?.tier || 'basic'})</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Daily</p>
                    <p className="text-white font-medium">{limits.daily.toLocaleString()} FRW</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Monthly</p>
                    <p className="text-white font-medium">{limits.monthly.toLocaleString()} FRW</p>
                  </div>
                </div>
              </div>

              {/* Withdrawal Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-zinc-300">Amount (FRW)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    disabled={!hasDeposit}
                    className="mt-1 bg-zinc-800 border-zinc-700 text-white text-lg"
                  />
                  {numAmount > 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-zinc-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Amount</span>
                        <span className="text-white">{numAmount.toLocaleString()} FRW</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-zinc-400">Fee (2%)</span>
                        <span className="text-red-400">-{fee.toLocaleString()} FRW</span>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t border-zinc-700">
                        <span className="text-zinc-300 font-medium">You receive</span>
                        <span className="text-emerald-400 font-bold">{netAmount.toLocaleString()} FRW</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-zinc-300">MTN Mobile Money Number</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="07XXXXXXXX"
                      disabled={!hasDeposit}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Withdraw Button */}
              <Button
                onClick={handleWithdraw}
                disabled={!canWithdraw || isProcessing}
                className={cn(
                  "w-full py-6 font-semibold text-lg",
                  canWithdraw
                    ? "bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Processing...</span>
                  </motion.div>
                ) : (
                  `Withdraw ${netAmount > 0 ? netAmount.toLocaleString() : ''} FRW`
                )}
              </Button>

              {/* Recent Withdrawals */}
              {recentWithdrawals.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-3">Recent Withdrawals</h3>
                  <div className="space-y-2">
                    {recentWithdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800"
                      >
                        <div>
                          <p className="font-medium text-white">{withdrawal.amount.toLocaleString()} FRW</p>
                          <p className="text-xs text-zinc-500">
                            Net: {withdrawal.netAmount.toLocaleString()} FRW
                          </p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          withdrawal.status === 'completed' 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : withdrawal.status === 'rejected'
                              ? "bg-red-500/20 text-red-400"
                              : "bg-amber-500/20 text-amber-400"
                        )}>
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Submitted!</h2>
                <p className="text-zinc-400">
                  Your withdrawal request has been submitted for processing
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">Amount</span>
                  <span className="text-white font-medium">{numAmount.toLocaleString()} FRW</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-400">Fee</span>
                  <span className="text-red-400">-{fee.toLocaleString()} FRW</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-700">
                  <span className="text-zinc-300">You will receive</span>
                  <span className="text-emerald-400 font-bold">{netAmount.toLocaleString()} FRW</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">
                  Processing time: {user?.tier === 'verified' ? '2-6' : user?.tier === 'premium' ? '12-24' : '24-48'} hours
                </p>
              </div>

              <Link href="/" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                  Back to Dashboard
                </Button>
              </Link>
            </motion.div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center"
              >
                <AlertCircle className="w-12 h-12 text-white" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Failed</h2>
                <p className="text-zinc-400">{errorMessage}</p>
              </div>

              <Button
                onClick={() => setStep('form')}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MobileNav />
    </div>
  )
}
